/*
  Warnings:

  - You are about to drop the column `subject` on the `Availability` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "offerId" TEXT,
    CONSTRAINT "Availability_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "TeachingOffer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Availability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Availability" ("date", "end", "id", "start", "teacherId") SELECT "date", "end", "id", "start", "teacherId" FROM "Availability";
DROP TABLE "Availability";
ALTER TABLE "new_Availability" RENAME TO "Availability";
CREATE INDEX "Availability_teacherId_idx" ON "Availability"("teacherId");
CREATE INDEX "Availability_offerId_idx" ON "Availability"("offerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
