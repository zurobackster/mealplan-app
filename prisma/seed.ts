import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (in correct order to avoid foreign key issues)
  await prisma.plannedMeal.deleteMany({});
  await prisma.weeklyPlan.deleteMany({});
  await prisma.meal.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleared existing data');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });
  console.log('Created user:', user.username);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
