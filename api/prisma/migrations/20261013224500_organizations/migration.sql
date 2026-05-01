CREATE TABLE "Organization" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

ALTER TABLE "User" ADD COLUMN "organizationId" UUID;
ALTER TABLE "Product" ADD COLUMN "organizationId" UUID;
ALTER TABLE "Booking" ADD COLUMN "organizationId" UUID;

INSERT INTO "Organization" ("id", "name", "slug", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000001', 'Klaro Demo', 'klaro-demo', CURRENT_TIMESTAMP);

UPDATE "User" SET "organizationId" = '00000000-0000-4000-8000-000000000001';
UPDATE "Product" SET "organizationId" = '00000000-0000-4000-8000-000000000001';
UPDATE "Booking" SET "organizationId" = '00000000-0000-4000-8000-000000000001';

ALTER TABLE "Product" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "organizationId" SET NOT NULL;

DROP INDEX "Product_sku_key";
CREATE UNIQUE INDEX "Product_organizationId_sku_key" ON "Product"("organizationId", "sku");

CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "Product_organizationId_category_idx" ON "Product"("organizationId", "category");
CREATE INDEX "Booking_organizationId_startTime_idx" ON "Booking"("organizationId", "startTime");

ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
