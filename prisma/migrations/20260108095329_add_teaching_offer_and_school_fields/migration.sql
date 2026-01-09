/*
  Warnings:

  - You are about to drop the column `level` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `schoolName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `schoolType` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `schoolType` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TeachingOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "schoolTrack" TEXT NOT NULL,
    "schoolForm" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "minGrade" INTEGER NOT NULL,
    "maxGrade" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeachingOffer_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeachingOffer_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "schoolTrackAttended" TEXT,
    "schoolFormAttended" TEXT
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
    "schoolTrack" TEXT,
    "schoolForm" TEXT,
    "schoolName" TEXT,
    "level" TEXT,
    "grade" INTEGER
);
INSERT INTO "new_User" ("createdAt", "email", "grade", "id", "level", "name", "password", "role", "schoolName", "stripeCustomerId") SELECT "createdAt", "email", "grade", "id", "level", "name", "password", "role", "schoolName", "stripeCustomerId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "TeachingOffer_teacherId_idx" ON "TeachingOffer"("teacherId");

-- CreateIndex
CREATE INDEX "TeachingOffer_subjectId_idx" ON "TeachingOffer"("subjectId");

-- CreateIndex
CREATE INDEX "TeachingOffer_schoolForm_level_minGrade_maxGrade_idx" ON "TeachingOffer"("schoolForm", "level", "minGrade", "maxGrade");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingOffer_teacherId_subjectId_schoolForm_level_minGrade_maxGrade_key" ON "TeachingOffer"("teacherId", "subjectId", "schoolForm", "level", "minGrade", "maxGrade");
