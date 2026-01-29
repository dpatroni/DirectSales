-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image_url" TEXT;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
