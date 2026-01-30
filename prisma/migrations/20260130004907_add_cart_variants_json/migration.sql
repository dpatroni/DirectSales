-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "selected_variant" JSONB;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "selected_variant" JSONB;
