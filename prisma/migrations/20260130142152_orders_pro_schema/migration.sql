/*
  Warnings:

  - You are about to drop the column `price_snapshot` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `total_money` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `total_points` on the `orders` table. All the data in the column will be lost.
  - Added the required column `final_price` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_total` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsapp_message` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `cycle_id` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_cycle_id_fkey";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "price_snapshot",
ADD COLUMN     "final_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "promo_id" TEXT,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total_money",
DROP COLUMN "total_points",
ADD COLUMN     "discount_total" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "whatsapp_message" TEXT NOT NULL,
ALTER COLUMN "cycle_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
