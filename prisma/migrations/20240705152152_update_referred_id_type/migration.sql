/*
  Warnings:

  - You are about to alter the column `referredId` on the `referrals` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[referredId]` on the table `Referrals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `referrals` MODIFY `referredId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Referrals_referredId_key` ON `Referrals`(`referredId`);
