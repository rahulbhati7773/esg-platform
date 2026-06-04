function parseCorsOrigins(value: string | undefined): string[] {
  const raw = value?.trim() || "http://localhost:5173";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  isProduction: process.env.NODE_ENV === "production",
};
