/*
  Warnings:

  - You are about to drop the column `order_status` on the `orders` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'closed', 'cancelled');

-- AlterTable - Add new columns first
ALTER TABLE "orders" 
ADD COLUMN "fulfillment_status" "FulfillmentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "payment_status" "PaymentStatus" NOT NULL DEFAULT 'unpaid';

-- Migrate existing data based on order_status
UPDATE "orders" SET 
  "payment_status" = CASE 
    WHEN "order_status" = 'paid' THEN 'paid'::"PaymentStatus"
    ELSE 'unpaid'::"PaymentStatus"
  END,
  "fulfillment_status" = CASE 
    WHEN "order_status" IN ('created', 'paid') THEN 'pending'::"FulfillmentStatus"
    WHEN "order_status" = 'processing' THEN 'processing'::"FulfillmentStatus"
    WHEN "order_status" = 'shipped' THEN 'shipped'::"FulfillmentStatus"
    WHEN "order_status" = 'delivered' THEN 'delivered'::"FulfillmentStatus"
    WHEN "order_status" = 'closed' THEN 'closed'::"FulfillmentStatus"
    ELSE 'pending'::"FulfillmentStatus"
  END;

-- DropIndex
DROP INDEX "orders_order_status_idx";

-- AlterTable - Now drop old column
ALTER TABLE "orders" DROP COLUMN "order_status";

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "orders_fulfillment_status_idx" ON "orders"("fulfillment_status");
