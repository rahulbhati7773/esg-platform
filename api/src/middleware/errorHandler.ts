import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { config } from "../config.js";
import { EntryServiceError } from "../errors.js";
import { EntryPermissionError } from "../lib/entryPermissions.js";
import { formatZodFieldErrors } from "./zodFieldErrors.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ fieldErrors: formatZodFieldErrors(err) });
    return;
  }

  if (err instanceof EntryPermissionError) {
    res.status(403).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof EntryServiceError) {
    if (err.code === "NOT_FOUND") {
      res.status(404).json({ error: err.message, code: err.code });
      return;
    }

    res.status(409).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof Error && err.message === "CORS_NOT_ALLOWED") {
    res.status(403).json({ error: "Origin not allowed by CORS policy" });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: config.isProduction
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error",
  });
};
