/*
  Warnings:

  - You are about to drop the column `endsAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `studentEmail` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `studentName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `end` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceCents` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "stripeSetupIntentId" TEXT,
    "stripePaymentIntentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "id", "status", "teacherId") SELECT "createdAt", "id", "status", "teacherId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
