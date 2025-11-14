import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.teacher.createMany({
    data: [
      {
        id: "t1",
        name: "Anna Weber",
        email: "anna.weber@example.com",
        subject: "Mathematik",
        password: "hashed-passwort-platzhalter",
        mustChangePassword: true,
      },
      {
        id: "t2",
        name: "Paul Schmidt",
        email: "paul.schmidt@example.com",
        subject: "Englisch",
        password: "hashed-passwort-platzhalter",
        mustChangePassword: true,
      },
    ],
  });

  await prisma.teacherApplication.createMany({
    data: [
      {
        name: "Max Bewerber",
        email: "max.bewerber@example.com",
        subject: "Physik",
        letter: "Ich möchte gerne Nachhilfe geben.",
        filePath: "/uploads/max-bewerbung.pdf",
      },
    ],
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
