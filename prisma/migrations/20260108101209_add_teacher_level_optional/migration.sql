/*
  Warnings:

  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeachingOffer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentMethodId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSetupIntentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `schoolFormAttended` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `schoolTrackAttended` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `schoolForm` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `schoolTrack` on the `User` table. All the data in the column will be lost.
  - Made the column `updatedAt` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Subject_name_key";

-- DropIndex
DROP INDEX "TeacherApplication_email_key";

-- DropIndex
DROP INDEX "TeachingOffer_teacherId_subjectId_schoolForm_level_minGrade_maxGrade_key";

-- DropIndex
DROP INDEX "TeachingOffer_schoolForm_level_minGrade_maxGrade_idx";

-- DropIndex
DROP INDEX "TeachingOffer_subjectId_idx";

-- DropIndex
DROP INDEX "TeachingOffer_teacherId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subject";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeacherApplication";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeachingOffer";
PRAGMA foreign_keys=on;

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "currency", "end", "id", "note", "priceCents", "start", "status", "studentId", "teacherId") SELECT "createdAt", "currency", "end", "id", "note", "priceCents", "start", "status", "studentId", "teacherId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "bookingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chat_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("bookingId", "createdAt", "id", "studentEmail", "teacherId", "updatedAt") SELECT "bookingId", "createdAt", "id", "studentEmail", "teacherId", "updatedAt" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE TABLE "new_Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "level" TEXT,
    "schoolType" TEXT,
    "schoolName" TEXT
);
INSERT INTO "new_Teacher" ("email", "id", "mustChangePassword", "name", "password", "subject") SELECT "email", "id", "mustChangePassword", "name", "password", "subject" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolType" TEXT,
    "schoolName" TEXT,
    "grade" INTEGER,
    "level" TEXT
);
INSERT INTO "new_User" ("createdAt", "email", "grade", "id", "level", "name", "password", "role", "schoolName", "stripeCustomerId") SELECT "createdAt", "email", "grade", "id", "level", "name", "password", "role", "schoolName", "stripeCustomerId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
