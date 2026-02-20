/*
  Warnings:

  - You are about to drop the column `age` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "age",
ADD COLUMN     "birthDate" TIMESTAMP(3);
