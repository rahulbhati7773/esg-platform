import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createEntry,
  listEntries,
  setStatus,
  updateEntry,
} from "../services/entries.js";
import {
  createEntrySchema,
  idParamSchema,
  listEntriesQuerySchema,
  updateEntrySchema,
  updateEntryStatusSchema,
} from "../validation.js";

export const entriesRouter = Router();

entriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = listEntriesQuerySchema.parse(req.query);
    const entries = await listEntries(filters);
    res.json(entries);
  }),
);

entriesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createEntrySchema.parse(req.body);
    const entry = await createEntry(input);
    res.status(201).json(entry);
  }),
);

entriesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateEntrySchema.parse(req.body);
    const entry = await updateEntry(id, input);
    res.json(entry);
  }),
);

entriesRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const { status } = updateEntryStatusSchema.parse(req.body);
    const entry = await setStatus(id, status);
    res.json(entry);
  }),
);
