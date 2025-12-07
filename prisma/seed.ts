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

  // Create categories
  const breakfastCategory = await prisma.category.create({
    data: {
      name: 'Breakfast Foods',
      color: '#FF6B6B',
    },
  });

  const mainDishesCategory = await prisma.category.create({
    data: {
      name: 'Main Dishes',
      color: '#4ECDC4',
    },
  });

  const dessertsCategory = await prisma.category.create({
    data: {
      name: 'Desserts',
      color: '#FFE66D',
    },
  });

  const snacksCategory = await prisma.category.create({
    data: {
      name: 'Snacks',
      color: '#95E1D3',
    },
  });

  console.log('Created 4 categories');

  // Create sample meals
  await prisma.meal.createMany({
    data: [
      {
        title: 'Classic Pancakes',
        categoryId: breakfastCategory.id,
        rating: 5,
        imageUrl: null,
        recipeText: 'Mix flour, eggs, milk, and sugar. Cook on a griddle until golden brown on both sides. Serve with maple syrup and fresh berries.',
      },
      {
        title: 'Scrambled Eggs',
        categoryId: breakfastCategory.id,
        rating: 4,
        imageUrl: null,
        recipeText: 'Whisk eggs with a splash of milk. Cook in a buttered pan over medium heat, stirring gently until fluffy and cooked through.',
      },
      {
        title: 'Grilled Chicken',
        categoryId: mainDishesCategory.id,
        rating: 5,
        imageUrl: null,
        recipeText: 'Season chicken breast with herbs and spices. Grill for 6-7 minutes per side until internal temperature reaches 165°F.',
      },
      {
        title: 'Spaghetti Carbonara',
        categoryId: mainDishesCategory.id,
        rating: 5,
        imageUrl: null,
        recipeText: 'Cook pasta al dente. Mix with eggs, parmesan, crispy bacon, and pasta water for a creamy sauce. Season with black pepper.',
      },
      {
        title: 'Vegetable Stir Fry',
        categoryId: mainDishesCategory.id,
        rating: 4,
        imageUrl: null,
        recipeText: 'Stir fry mixed vegetables in sesame oil with garlic and ginger. Add soy sauce and serve over rice.',
      },
      {
        title: 'Chocolate Cake',
        categoryId: dessertsCategory.id,
        rating: 5,
        imageUrl: null,
        recipeText: 'Mix dry ingredients, add wet ingredients, bake at 350°F for 30-35 minutes. Frost with chocolate ganache when cooled.',
      },
      {
        title: 'Fresh Fruit Salad',
        categoryId: dessertsCategory.id,
        rating: 4,
        imageUrl: null,
        recipeText: 'Chop fresh seasonal fruits (strawberries, blueberries, mango, kiwi). Toss with honey and a squeeze of lime juice.',
      },
      {
        title: 'Trail Mix',
        categoryId: snacksCategory.id,
        rating: 4,
        imageUrl: null,
        recipeText: 'Mix nuts, dried fruits, dark chocolate chips, and seeds. Store in an airtight container for a quick snack.',
      },
    ],
  });

  console.log('Created 8 meals');
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
