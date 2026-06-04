import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  dataQuality,
  facilityComparison,
  kpiSummary,
  targetStatus,
  trend,
} from "../services/analytics.js";
import {
  analyticsPeriodQuerySchema,
  facilityComparisonQuerySchema,
  trendQuerySchema,
} from "../validation.js";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/kpis",
  asyncHandler(async (req, res) => {
    const { period, facilityId } = analyticsPeriodQuerySchema.parse(req.query);
    const kpis = await kpiSummary({ ...period, facilityId });
    res.json(kpis);
  }),
);

analyticsRouter.get(
  "/trend",
  asyncHandler(async (req, res) => {
    const { metricId, range } = trendQuerySchema.parse(req.query);
    const series = await trend(metricId, range);
    res.json(series);
  }),
);

analyticsRouter.get(
  "/facility-comparison",
  asyncHandler(async (req, res) => {
    const { metricId, period, facilityId } = facilityComparisonQuerySchema.parse(
      req.query,
    );
    const comparison = await facilityComparison(metricId, {
      ...period,
      facilityId,
    });
    res.json(comparison);
  }),
);

analyticsRouter.get(
  "/targets",
  asyncHandler(async (req, res) => {
    const { period, facilityId } = analyticsPeriodQuerySchema.parse(req.query);
    const targets = await targetStatus({ ...period, facilityId });
    res.json(targets);
  }),
);

analyticsRouter.get(
  "/data-quality",
  asyncHandler(async (req, res) => {
    const { period, facilityId } = analyticsPeriodQuerySchema.parse(req.query);
    const quality = await dataQuality({ ...period, facilityId });
    res.json(quality);
  }),
);
