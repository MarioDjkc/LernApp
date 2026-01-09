/*
  Warnings:

  - You are about to drop the column `schoolFormAttended` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `schoolTrackAttended` on the `Teacher` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Teacher" ("email", "id", "mustChangePassword", "name", "password", "subject") SELECT "email", "id", "mustChangePassword", "name", "password", "subject" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
