import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.categories.createMany({
    data: [
      { name: 'Technology' },
      { name: 'Home - Garden' },
      { name: 'Fashion' },
      { name: 'Office' },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
