import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  listCategories,
  listFacilities,
  listMetrics,
} from "../services/catalog.js";

export const catalogRouter = Router();

catalogRouter.get(
  "/facilities",
  asyncHandler(async (_req, res) => {
    const facilities = await listFacilities();
    res.json(facilities);
  }),
);

catalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await listCategories();
    res.json(categories);
  }),
);

catalogRouter.get(
  "/metrics",
  asyncHandler(async (_req, res) => {
    const metrics = await listMetrics();
    res.json(metrics);
  }),
);
