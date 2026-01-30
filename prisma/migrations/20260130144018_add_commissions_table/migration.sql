-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "default_commission_rate" DECIMAL(10,2) NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "commission_amount" DECIMAL(10,2) NOT NULL,
    "commission_rate" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "consultants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
