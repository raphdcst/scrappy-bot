-- DropForeignKey
ALTER TABLE "Monitor" DROP CONSTRAINT "Monitor_itemId_fkey";

-- AddForeignKey
ALTER TABLE "Monitor" ADD CONSTRAINT "Monitor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;
