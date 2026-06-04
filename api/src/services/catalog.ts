import { prisma } from "../db.js";

export async function listFacilities() {
  return prisma.facility.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listCategories() {
  return prisma.metricCategory.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listMetrics() {
  return prisma.metric.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
}
