CREATE TABLE "Product" (
  "id" UUID NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "quantity" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "product_positive_quantity" CHECK ("quantity" > 0)
);

CREATE TABLE "BookingItem" (
  "id" UUID NOT NULL,
  "bookingId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "booking_item_positive_quantity" CHECK ("quantity" > 0)
);

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
CREATE UNIQUE INDEX "BookingItem_bookingId_productId_key" ON "BookingItem"("bookingId", "productId");
CREATE INDEX "BookingItem_productId_idx" ON "BookingItem"("productId");
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Booking_active_interval_idx";
CREATE INDEX "Booking_active_interval_idx" ON "Booking"("startTime", "endTime") WHERE "status" <> 'CANCELLED';
