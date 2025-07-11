/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Upload` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `instagram` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kwai` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tiktok` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `youtube` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_userId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "ownerId",
DROP COLUMN "userId",
ADD COLUMN     "instagram" JSONB NOT NULL,
ADD COLUMN     "kwai" JSONB NOT NULL,
ADD COLUMN     "tiktok" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "youtube" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");
