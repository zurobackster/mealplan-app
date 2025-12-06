import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import dayjs from 'dayjs';

// Slot order for sorting
const SLOT_ORDER = {
  BREAKFAST: 1,
  LUNCH: 2,
  DINNER: 3,
  OTHER: 4,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStartDateStr = searchParams.get('weekStartDate');

    if (!weekStartDateStr) {
      return NextResponse.json(
        { error: 'weekStartDate parameter is required' },
        { status: 400 }
      );
    }

    const weekStartDate = new Date(weekStartDateStr);

    // Fetch weekly plan with full meal data
    const weeklyPlan = await prisma.weeklyPlan.findUnique({
      where: { weekStartDate },
      include: {
        plannedMeals: {
          include: {
            meal: {
              select: {
                id: true,
                title: true,
                rating: true,
                recipeText: true,
                imageUrl: true,
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { slot: 'asc' },
          ],
        },
      },
    });

    // If no weekly plan exists, return empty data structure
    if (!weeklyPlan) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = dayjs(weekStartDate).add(i, 'days');
        return {
          dayOfWeek: i + 1,
          date: date.format('ddd, MMM D'),
          meals: [],
        };
      });

      return NextResponse.json({
        weekStartDate: weekStartDateStr,
        days,
      });
    }

    // Group planned meals by day
    const mealsByDay = new Map<number, any[]>();

    weeklyPlan.plannedMeals.forEach((plannedMeal) => {
      if (!mealsByDay.has(plannedMeal.dayOfWeek)) {
        mealsByDay.set(plannedMeal.dayOfWeek, []);
      }

      mealsByDay.get(plannedMeal.dayOfWeek)!.push({
        slot: plannedMeal.slot,
        mealId: plannedMeal.meal.id,
        title: plannedMeal.meal.title,
        rating: plannedMeal.meal.rating,
        recipeText: plannedMeal.meal.recipeText,
        imageUrl: plannedMeal.meal.imageUrl,
      });
    });

    // Sort meals within each day by slot order
    mealsByDay.forEach((meals) => {
      meals.sort((a, b) => {
        return (SLOT_ORDER[a.slot as keyof typeof SLOT_ORDER] || 99) -
               (SLOT_ORDER[b.slot as keyof typeof SLOT_ORDER] || 99);
      });
    });

    // Create days array (all 7 days, Mon-Sun)
    const days = Array.from({ length: 7 }, (_, i) => {
      const dayOfWeek = i + 1;
      const date = dayjs(weekStartDate).add(i, 'days');
      const meals = mealsByDay.get(dayOfWeek) || [];

      return {
        dayOfWeek,
        date: date.format('ddd, MMM D'),
        meals,
      };
    });

    return NextResponse.json({
      weekStartDate: weekStartDateStr,
      days,
    });
  } catch (error) {
    console.error('Error fetching weekly ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly ingredients' },
      { status: 500 }
    );
  }
}
