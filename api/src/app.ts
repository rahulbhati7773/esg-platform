import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { analyticsRouter } from "./routes/analytics.js";
import { catalogRouter } from "./routes/catalog.js";
import { entriesRouter } from "./routes/entries.js";
import { reportRouter } from "./routes/report.js";

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(catalogRouter);
  app.use("/entries", entriesRouter);
  app.use("/analytics", analyticsRouter);
  app.use("/report", reportRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
