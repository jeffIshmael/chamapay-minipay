const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  // Delete entries for specific models
  await prisma.chama.deleteMany();
  await prisma.user.deleteMany(); // Replace 'user' with your actual model names
  // Repeat for any other models you want to clear
  
}

clearDatabase()
  .then(() => {
    console.log('Database cleared');
  })
  .catch((error) => {
    console.error('Error clearing database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
