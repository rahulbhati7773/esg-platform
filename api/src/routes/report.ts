import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { buildExcelReport, buildPdfReport } from "../services/reports.js";
import { reportQuerySchema } from "../validation.js";

export const reportRouter = Router();

function reportFilename(
  periodStart: Date,
  periodEnd: Date,
  extension: string,
): string {
  const start = periodStart.toISOString().slice(0, 10);
  const end = periodEnd.toISOString().slice(0, 10);
  return `esg-report-${start}-${end}.${extension}`;
}

reportRouter.get(
  "/excel",
  asyncHandler(async (req, res) => {
    const { period, facilityId } = reportQuerySchema.parse(req.query);
    const periodRange = { ...period, facilityId };
    const buffer = await buildExcelReport(periodRange);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${reportFilename(period.periodStart, period.periodEnd, "xlsx")}"`,
    );
    res.send(buffer);
  }),
);

reportRouter.get(
  "/pdf",
  asyncHandler(async (req, res) => {
    const { period, facilityId } = reportQuerySchema.parse(req.query);
    const periodRange = { ...period, facilityId };
    const buffer = await buildPdfReport(periodRange);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${reportFilename(period.periodStart, period.periodEnd, "pdf")}"`,
    );
    res.send(buffer);
  }),
);
