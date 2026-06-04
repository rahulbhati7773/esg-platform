import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "../db.js";
import {
  kpiSummary,
  targetStatus,
  type KpiSummaryItem,
  type PeriodRange,
  type TargetStatusItem,
} from "./analytics.js";

function periodLabel(period: PeriodRange): string {
  const start = period.periodStart.toISOString().slice(0, 10);
  const end = period.periodEnd.toISOString().slice(0, 10);
  return `${start} to ${end}`;
}

async function resolveFacilityName(
  facilityId: number | undefined,
): Promise<string> {
  if (facilityId === undefined) {
    return "All facilities";
  }
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    select: { name: true },
  });
  return facility?.name ?? `Facility #${facilityId}`;
}

async function fetchReportEntries(period: PeriodRange) {
  return prisma.esgEntry.findMany({
    where: {
      periodStart: { lte: period.periodEnd },
      periodEnd: { gte: period.periodStart },
      ...(period.facilityId !== undefined
        ? { facilityId: period.facilityId }
        : {}),
    },
    include: {
      facility: { select: { name: true } },
      metric: {
        select: {
          name: true,
          unit: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: [
      { facility: { name: "asc" } },
      { metric: { name: "asc" } },
      { periodStart: "asc" },
    ],
  });
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${value.toFixed(1)}%`;
}

function addSummarySheet(
  workbook: ExcelJS.Workbook,
  period: PeriodRange,
  facilityLabel: string,
  kpis: KpiSummaryItem[],
  targets: TargetStatusItem[],
): void {
  const sheet = workbook.addWorksheet("Summary");
  const titleFont: Partial<ExcelJS.Font> = { bold: true, size: 14 };
  const headerFont: Partial<ExcelJS.Font> = { bold: true };

  sheet.addRow(["ESG Report Summary"]).font = titleFont;
  sheet.addRow(["Reporting period", periodLabel(period)]);
  sheet.addRow(["Facility scope", facilityLabel]);
  sheet.addRow([]);

  sheet.addRow(["Key performance indicators"]).font = headerFont;
  const kpiHeader = sheet.addRow([
    "Metric",
    "Unit",
    "Total",
    "Previous period",
    "Delta",
    "Delta %",
  ]);
  kpiHeader.font = headerFont;
  for (const kpi of kpis) {
    sheet.addRow([
      kpi.metric,
      kpi.unit,
      kpi.total,
      kpi.previousTotal,
      kpi.delta,
      formatPercent(kpi.deltaPercent),
    ]);
  }

  sheet.addRow([]);
  sheet.addRow(["Targets (RAG vs target)"]).font = headerFont;
  const targetHeader = sheet.addRow([
    "Metric",
    "Facility",
    "Actual",
    "Target",
    "RAG",
  ]);
  targetHeader.font = headerFont;
  for (const target of targets) {
    sheet.addRow([
      target.metric,
      target.facility ?? "All",
      target.actual,
      target.target,
      target.rag.toUpperCase(),
    ]);
  }

  sheet.columns = [
    { width: 28 },
    { width: 14 },
    { width: 14 },
    { width: 18 },
    { width: 12 },
    { width: 12 },
  ];
}

function addDetailsSheet(
  workbook: ExcelJS.Workbook,
  entries: Awaited<ReturnType<typeof fetchReportEntries>>,
): void {
  const sheet = workbook.addWorksheet("Details");
  const headerFont: Partial<ExcelJS.Font> = { bold: true };

  const header = sheet.addRow([
    "ID",
    "Facility",
    "Category",
    "Metric",
    "Unit",
    "Period start",
    "Period end",
    "Value",
    "Status",
    "Source",
  ]);
  header.font = headerFont;

  for (const entry of entries) {
    sheet.addRow([
      entry.id,
      entry.facility.name,
      entry.metric.category.name,
      entry.metric.name,
      entry.metric.unit,
      formatDate(entry.periodStart),
      formatDate(entry.periodEnd),
      entry.value,
      entry.status,
      entry.source ?? "",
    ]);
  }

  sheet.columns = [
    { width: 8 },
    { width: 22 },
    { width: 18 },
    { width: 24 },
    { width: 10 },
    { width: 14 },
    { width: 14 },
    { width: 12 },
    { width: 12 },
    { width: 24 },
  ];
}

export async function buildExcelReport(period: PeriodRange): Promise<Buffer> {
  const [kpis, targets, entries, facilityLabel] = await Promise.all([
    kpiSummary(period),
    targetStatus(period),
    fetchReportEntries(period),
    resolveFacilityName(period.facilityId),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ESG Platform";
  workbook.created = new Date();

  addSummarySheet(workbook, period, facilityLabel, kpis, targets);
  addDetailsSheet(workbook, entries);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function writePdfSection(
  doc: InstanceType<typeof PDFDocument>,
  title: string,
  rows: string[][],
): void {
  doc.fontSize(12).font("Helvetica-Bold").text(title);
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica");
  for (const row of rows) {
    doc.text(row.join("  |  "));
  }
  doc.moveDown();
}

export async function buildPdfReport(period: PeriodRange): Promise<Buffer> {
  const [kpis, targets, facilityLabel] = await Promise.all([
    kpiSummary(period),
    targetStatus(period),
    resolveFacilityName(period.facilityId),
  ]);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).font("Helvetica-Bold").text("ESG Report Summary");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Period: ${periodLabel(period)}`);
    doc.text(`Facility: ${facilityLabel}`);
    doc.moveDown();

    writePdfSection(
      doc,
      "Key performance indicators",
      kpis.map((kpi) => [
        kpi.metric,
        `${kpi.total} ${kpi.unit}`,
        `Δ ${kpi.delta} (${formatPercent(kpi.deltaPercent)})`,
      ]),
    );

    writePdfSection(
      doc,
      "Targets (RAG)",
      targets.map((target) => [
        target.metric,
        target.facility ?? "All",
        `actual ${target.actual} / target ${target.target}`,
        target.rag.toUpperCase(),
      ]),
    );

    doc.end();
  });
}
