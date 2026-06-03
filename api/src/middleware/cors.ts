import cors from "cors";
import type { RequestHandler } from "express";
import { config } from "../config.js";

export const corsMiddleware: RequestHandler = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS_NOT_ALLOWED"));
  },
  credentials: true,
});
