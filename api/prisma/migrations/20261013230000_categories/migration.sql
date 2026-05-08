CREATE TABLE "Category" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_organizationId_name_key" ON "Category"("organizationId", "name");
CREATE UNIQUE INDEX "Category_organizationId_slug_key" ON "Category"("organizationId", "slug");
CREATE INDEX "Category_organizationId_createdAt_idx" ON "Category"("organizationId", "createdAt");

ALTER TABLE "Category" ADD CONSTRAINT "Category_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Category" ("organizationId", "name", "slug")
SELECT DISTINCT
  "organizationId",
  "category",
  CONCAT(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("category"), '[^a-z0-9]+', '-', 'g')),
    '-',
    SUBSTRING(MD5("organizationId"::text || ':' || "category") FROM 1 FOR 6)
  )
FROM "Product";

ALTER TABLE "Product" ADD COLUMN "categoryId" UUID;

UPDATE "Product" AS product
SET "categoryId" = category."id"
FROM "Category" AS category
WHERE category."organizationId" = product."organizationId"
  AND category."name" = product."category";

ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Product_category_idx";
DROP INDEX IF EXISTS "Product_organizationId_category_idx";
CREATE INDEX "Product_organizationId_categoryId_idx" ON "Product"("organizationId", "categoryId");
ALTER TABLE "Product" DROP COLUMN "category";
