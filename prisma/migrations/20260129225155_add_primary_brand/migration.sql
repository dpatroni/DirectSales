-- AlterTable
ALTER TABLE "consultants" ADD COLUMN     "primary_brand_id" TEXT;

-- AddForeignKey
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_primary_brand_id_fkey" FOREIGN KEY ("primary_brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
