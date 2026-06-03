import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_USER = "seed-script";

type MetricSeed = {
  name: string;
  unit: string;
  category: "Environmental" | "Social" | "Governance";
  /** Matches analytics KPI keys: emissions, energy, water, waste */
  kpiKey?: "emissions" | "energy" | "water" | "waste";
  baseValue: number;
  trend: "emissions_down" | "pm_down" | "seasonal" | "improve_down" | "improve_up";
};

const FACILITIES = [
  {
    name: "Plant A",
    type: "Manufacturing",
    location: "Sheffield, UK",
    factor: 1.0,
  },
  {
    name: "Plant B",
    type: "Manufacturing",
    location: "Leeds, UK",
    factor: 1.08,
  },
  {
    name: "Mine Site C",
    type: "Mining",
    location: "Pilbara, AU",
    factor: 1.22,
  },
] as const;

const METRICS: MetricSeed[] = [
  {
    name: "CO2e Emissions",
    unit: "tonnes",
    category: "Environmental",
    kpiKey: "emissions",
    baseValue: 1200,
    trend: "emissions_down",
  },
  {
    name: "Energy Consumption",
    unit: "kWh",
    category: "Environmental",
    kpiKey: "energy",
    baseValue: 850_000,
    trend: "seasonal",
  },
  {
    name: "Water Withdrawal",
    unit: "kL",
    category: "Environmental",
    kpiKey: "water",
    baseValue: 42_000,
    trend: "seasonal",
  },
  {
    name: "Waste Generated",
    unit: "tonnes",
    category: "Environmental",
    kpiKey: "waste",
    baseValue: 380,
    trend: "improve_down",
  },
  {
    name: "Waste Recycled",
    unit: "tonnes",
    category: "Environmental",
    baseValue: 210,
    trend: "improve_up",
  },
  {
    name: "Particulate Matter (PM)",
    unit: "µg/m³",
    category: "Environmental",
    baseValue: 28,
    trend: "pm_down",
  },
  {
    name: "LTIFR",
    unit: "rate",
    category: "Social",
    baseValue: 2.4,
    trend: "improve_down",
  },
  {
    name: "Training Hours",
    unit: "hrs",
    category: "Social",
    baseValue: 12_500,
    trend: "improve_up",
  },
  {
    name: "Diversity",
    unit: "%",
    category: "Social",
    baseValue: 32,
    trend: "improve_up",
  },
  {
    name: "Community Spend",
    unit: "USD",
    category: "Social",
    baseValue: 185_000,
    trend: "improve_up",
  },
  {
    name: "Compliance Incidents",
    unit: "count",
    category: "Governance",
    baseValue: 6,
    trend: "improve_down",
  },
  {
    name: "Audit Findings",
    unit: "count",
    category: "Governance",
    baseValue: 14,
    trend: "improve_down",
  },
];

const ENVIRONMENTAL_TARGET_METRICS = [
  "CO2e Emissions",
  "Energy Consumption",
  "Water Withdrawal",
  "Waste Generated",
  "Waste Recycled",
  "Particulate Matter (PM)",
];

function monthBounds(year: number, monthIndex: number) {
  const periodStart = new Date(Date.UTC(year, monthIndex, 1));
  const periodEnd = new Date(Date.UTC(year, monthIndex + 1, 0));
  return { periodStart, periodEnd };
}

function statusForEntry(
  facilityIndex: number,
  monthIndex: number,
  metricIndex: number,
): string {
  const bucket = (facilityIndex * 17 + monthIndex * 13 + metricIndex * 7) % 10;
  if (bucket < 7) {
    return "approved";
  }
  if (bucket < 9) {
    return "submitted";
  }
  return "draft";
}

function computeValue(
  metric: MetricSeed,
  monthIndex: number,
  facilityFactor: number,
): number {
  const m = monthIndex;
  const base = metric.baseValue * facilityFactor;

  switch (metric.trend) {
    case "emissions_down":
    case "pm_down":
      return round(base * Math.pow(0.99, m) * jitter(metric.name, m, 0.03));
    case "seasonal": {
      const seasonal = 1 + 0.12 * Math.sin((m / 12) * Math.PI * 2);
      return round(base * seasonal * jitter(metric.name, m, 0.04));
    }
    case "improve_down":
      return round(base * (1 - m * 0.008) * jitter(metric.name, m, 0.05));
    case "improve_up":
      return round(base * (1 + m * 0.006) * jitter(metric.name, m, 0.04));
    default:
      return round(base);
  }
}

function jitter(seed: string, monthIndex: number, amplitude: number): number {
  const hash =
    seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) +
    monthIndex * 31;
  const wave = Math.sin(hash) * amplitude;
  return 1 + wave;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

async function clearDatabase() {
  await prisma.entryAudit.deleteMany();
  await prisma.esgEntry.deleteMany();
  await prisma.target.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.metricCategory.deleteMany();
  await prisma.facility.deleteMany();
}

async function main() {
  console.log("Clearing existing data…");
  await clearDatabase();

  const categories = new Map<string, number>();
  for (const name of ["Environmental", "Social", "Governance"] as const) {
    const category = await prisma.metricCategory.create({ data: { name } });
    categories.set(name, category.id);
  }

  const facilities = [];
  for (const facility of FACILITIES) {
    facilities.push(
      await prisma.facility.create({
        data: {
          name: facility.name,
          type: facility.type,
          location: facility.location,
        },
      }),
    );
  }

  const metrics = [];
  for (const metric of METRICS) {
    const categoryId = categories.get(metric.category);
    if (!categoryId) {
      throw new Error(`Missing category: ${metric.category}`);
    }
    metrics.push(
      await prisma.metric.create({
        data: {
          name: metric.name,
          unit: metric.unit,
          categoryId,
        },
      }),
    );
  }

  let targetCount = 0;
  const seedYear = 2025;

  for (const facility of facilities) {
    const facilityDef = FACILITIES.find((item) => item.name === facility.name);
    const factor = facilityDef?.factor ?? 1;

    for (const metric of metrics) {
      if (!ENVIRONMENTAL_TARGET_METRICS.includes(metric.name)) {
        continue;
      }

      const definition = METRICS.find((item) => item.name === metric.name);
      if (!definition) {
        continue;
      }

      let annualActual = 0;
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        annualActual += computeValue(definition, monthIndex, factor);
      }

      const facilityIndex = facilities.findIndex((item) => item.id === facility.id);
      const targetMultipliers = [1.05, 0.98, 0.82];
      const targetValue = round(
        annualActual * (targetMultipliers[facilityIndex] ?? 0.97),
      );

      await prisma.target.create({
        data: {
          metricId: metric.id,
          facilityId: facility.id,
          targetValue,
          period: String(seedYear),
        },
      });
      targetCount += 1;
    }
  }

  let entryCount = 0;
  let auditCount = 0;

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const { periodStart, periodEnd } = monthBounds(seedYear, monthIndex);

    for (let facilityIndex = 0; facilityIndex < facilities.length; facilityIndex += 1) {
      const facility = facilities[facilityIndex];
      const facilityDef = FACILITIES[facilityIndex];

      for (let metricIndex = 0; metricIndex < metrics.length; metricIndex += 1) {
        const metric = metrics[metricIndex];
        const definition = METRICS[metricIndex];
        const value = computeValue(definition, monthIndex, facilityDef.factor);
        const status = statusForEntry(facilityIndex, monthIndex, metricIndex);

        const entry = await prisma.esgEntry.create({
          data: {
            facilityId: facility.id,
            metricId: metric.id,
            value,
            periodStart,
            periodEnd,
            source: "seed",
            enteredBy: SEED_USER,
            status,
          },
        });
        entryCount += 1;

        await prisma.entryAudit.create({
          data: {
            entryId: entry.id,
            action: "create",
            newValue: value,
            changedBy: SEED_USER,
          },
        });
        auditCount += 1;
      }
    }
  }

  console.log("\nSeed complete:");
  console.log(`  Facilities:      ${facilities.length}`);
  console.log(`  Categories:      ${categories.size}`);
  console.log(`  Metrics:         ${metrics.length}`);
  console.log(`  Targets:         ${targetCount}`);
  console.log(`  EsgEntry rows:   ${entryCount}`);
  console.log(`  EntryAudit rows: ${auditCount}`);
  console.log(
    `  Period covered:  ${seedYear}-01 → ${seedYear}-12 (${facilities.length} sites × ${metrics.length} metrics × 12 months)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
