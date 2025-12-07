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

    // CRITICAL: Work with date strings to avoid timezone issues
    // Parse as UTC to prevent timezone shifting
    const normalizedDateStr = weekStartDateStr; // Already in YYYY-MM-DD format
    const weekStartDate = new Date(normalizedDateStr + 'T00:00:00.000Z');

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

    // If no weekly plan exists, return empty
    if (!weeklyPlan) {
      return NextResponse.json({
        weekStartDate: weekStartDateStr,
        meals: [],
      });
    }

    // Group by meal
    const mealMap = new Map<number, {
      mealId: number;
      title: string;
      rating: number;
      recipeText: string | null;
      imageUrl: string | null;
      daySlots: Map<number, Set<string>>;
      earliestDay: number;
    }>();

    weeklyPlan.plannedMeals.forEach((plannedMeal) => {
      const mealId = plannedMeal.meal.id;

      if (!mealMap.has(mealId)) {
        mealMap.set(mealId, {
          mealId,
          title: plannedMeal.meal.title,
          rating: plannedMeal.meal.rating,
          recipeText: plannedMeal.meal.recipeText,
          imageUrl: plannedMeal.meal.imageUrl,
          daySlots: new Map<number, Set<string>>(),
          earliestDay: plannedMeal.dayOfWeek,
        });
      }

      const meal = mealMap.get(mealId)!;

      // Track earliest day
      meal.earliestDay = Math.min(meal.earliestDay, plannedMeal.dayOfWeek);

      // Add slot to day
      if (!meal.daySlots.has(plannedMeal.dayOfWeek)) {
        meal.daySlots.set(plannedMeal.dayOfWeek, new Set());
      }
      meal.daySlots.get(plannedMeal.dayOfWeek)!.add(plannedMeal.slot);
    });

    // Format and sort meals
    const meals = Array.from(mealMap.values()).map((meal) => {
      const plannedDays = Array.from(meal.daySlots.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([dayOfWeek, slots]) => {
          // Use normalized Monday string to calculate dates
          const date = dayjs(normalizedDateStr).add(dayOfWeek - 1, 'days');
          const sortedSlots = Array.from(slots).sort(
            (a, b) => (SLOT_ORDER[a as keyof typeof SLOT_ORDER] || 99) - (SLOT_ORDER[b as keyof typeof SLOT_ORDER] || 99)
          );
          return {
            dayOfWeek,
            date: date.format('ddd, MMM D'),
            slots: sortedSlots,
          };
        });

      return {
        mealId: meal.mealId,
        title: meal.title,
        rating: meal.rating,
        recipeText: meal.recipeText,
        imageUrl: meal.imageUrl,
        plannedDays,
        earliestDay: meal.earliestDay,
      };
    });

    // Sort by earliest day
    meals.sort((a, b) => a.earliestDay - b.earliestDay);

    return NextResponse.json({
      weekStartDate: weekStartDateStr,
      meals,
    });
  } catch (error) {
    console.error('Error fetching weekly ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly ingredients' },
      { status: 500 }
    );
  }
}
