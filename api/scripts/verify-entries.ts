import { prisma } from "../src/db.js";
import { createEntry, listEntries } from "../src/services/entries.js";

async function ensureFixtures() {
  const category = await prisma.metricCategory.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Environmental" },
  });

  const facility = await prisma.facility.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Verify Plant",
      type: "Manufacturing",
      location: "Test City",
    },
  });

  const metric = await prisma.metric.upsert({
    where: { id: 1 },
    update: {},
    create: {
      categoryId: category.id,
      name: "Scope 1 Emissions",
      unit: "tCO2e",
    },
  });

  return { facility, metric };
}

async function main() {
  const { facility, metric } = await ensureFixtures();

  const created = await createEntry({
    facilityId: facility.id,
    metricId: metric.id,
    value: 42.5,
    periodStart: "2025-01-01",
    periodEnd: "2025-01-31",
    source: "manual",
    enteredBy: "verify-script",
  });

  const listed = await listEntries({ facilityId: facility.id });

  const match = listed.find((entry) => entry.id === created.id);

  console.log("Created entry:");
  console.log(JSON.stringify(created, null, 2));
  console.log("\nListed entry (with audits):");
  console.log(JSON.stringify(match, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
