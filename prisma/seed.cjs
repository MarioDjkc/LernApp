const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Beispiel-Lehrer
  await prisma.teacher.create({
    data: {
      id: "1",
      name: "Simon",
      email: "kicker2812@gmail.com",
      subject: "Mathematik",
      password: "test123",
      mustChangePassword: false
    }
  });

  // Beispiel-Schüler
  await prisma.user.create({
    data: {
      id: "u1",
      email: "test@test.com",
      password: "test123",
      name: "Test Schüler"
    }
  });

  console.log("🌱 Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });