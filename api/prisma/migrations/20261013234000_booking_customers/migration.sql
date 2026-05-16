CREATE TABLE "Customer" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "registrationNumber" TEXT,
  "contactName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_organizationId_registrationNumber_key" ON "Customer"("organizationId", "registrationNumber");
CREATE INDEX "Customer_organizationId_name_idx" ON "Customer"("organizationId", "name");
CREATE INDEX "Customer_organizationId_createdAt_idx" ON "Customer"("organizationId", "createdAt");

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD COLUMN "customerId" UUID;

-- Preserve existing rentals by grouping them under a clearly marked legacy customer.
INSERT INTO "Customer" ("id", "organizationId", "name", "createdAt", "updatedAt")
SELECT gen_random_uuid(), organization_id, 'Existing bookings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "organizationId" AS organization_id FROM "Booking") organizations;

UPDATE "Booking" booking
SET "customerId" = customer."id"
FROM "Customer" customer
WHERE customer."organizationId" = booking."organizationId"
  AND customer."name" = 'Existing bookings';

ALTER TABLE "Booking" ALTER COLUMN "customerId" SET NOT NULL;
CREATE INDEX "Booking_customerId_startTime_idx" ON "Booking"("customerId", "startTime");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
