import prisma from "../config/prisma";

async function testPrisma() {
  const newUser = await prisma.user.create({
    data: {
      id: "test",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date(),
    },
  });

  console.log("New user created:", newUser);

  const allUsers = await prisma.user.findMany();
  console.log("All users:", allUsers);
}

testPrisma()
  .then(() => {
    console.log("Test completed successfully");
  })
  .catch((error) => {
    console.error("Error during test:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
  //