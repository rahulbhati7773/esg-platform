import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  assertCanCreate,
  assertCanEditEntryValue,
  assertStatusTransitionAllowed,
  parseAppRole,
} from "../lib/entryPermissions.js";
import {
  createEntry,
  getEntryById,
  listEntries,
  setStatus,
  updateEntry,
} from "../services/entries.js";
import {
  createEntrySchema,
  entryStatusSchema,
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
    assertCanCreate(parseAppRole(req.header("x-app-role")));
    const input = createEntrySchema.parse(req.body);
    const entry = await createEntry(input);
    res.status(201).json(entry);
  }),
);

entriesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const role = parseAppRole(req.header("x-app-role"));
    const { id } = idParamSchema.parse(req.params);
    const existing = await getEntryById(id);
    if (!existing) {
      res.status(404).json({ error: `Entry ${id} not found`, code: "NOT_FOUND" });
      return;
    }
    assertCanEditEntryValue(role, existing.status);
    const input = updateEntrySchema.parse(req.body);
    const entry = await updateEntry(id, input);
    res.json(entry);
  }),
);

entriesRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const role = parseAppRole(req.header("x-app-role"));
    const { id } = idParamSchema.parse(req.params);
    const existing = await getEntryById(id);
    if (!existing) {
      res.status(404).json({ error: `Entry ${id} not found`, code: "NOT_FOUND" });
      return;
    }
    const { status: nextStatus } = updateEntryStatusSchema.parse(req.body);
    const currentStatus = entryStatusSchema.parse(existing.status);
    assertStatusTransitionAllowed(role, currentStatus, nextStatus);
    const entry = await setStatus(id, nextStatus);
    res.json(entry);
  }),
);
