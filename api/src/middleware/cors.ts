import cors from "cors";
import type { RequestHandler } from "express";
import { config } from "../config.js";

function isLocalDevOrigin(origin: string): boolean {
  if (config.isProduction) {
    return false;
  }
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export const corsMiddleware: RequestHandler = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.corsOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS_NOT_ALLOWED"));
  },
  credentials: true,
});
