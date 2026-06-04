-- CreateTable
CREATE TABLE "Facility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT
);

-- CreateTable
CREATE TABLE "MetricCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    CONSTRAINT "Metric_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MetricCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EsgEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "facilityId" INTEGER NOT NULL,
    "metricId" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "source" TEXT,
    "enteredBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EsgEntry_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EsgEntry_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryAudit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" REAL,
    "newValue" REAL,
    "changedBy" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntryAudit_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "EsgEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Target" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metricId" INTEGER NOT NULL,
    "facilityId" INTEGER,
    "targetValue" REAL NOT NULL,
    "period" TEXT NOT NULL,
    CONSTRAINT "Target_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Target_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
