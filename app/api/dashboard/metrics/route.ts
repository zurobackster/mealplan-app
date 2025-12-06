import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isoWeek);
dayjs.extend(utc);

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get week parameter (optional, defaults to current week)
    const searchParams = request.nextUrl.searchParams;
    const weekStartDateParam = searchParams.get('weekStartDate');

    // Calculate week start date in UTC
    const weekStartDate = weekStartDateParam
      ? dayjs.utc(weekStartDateParam).isoWeekday(1).startOf('day').toDate()
      : dayjs.utc().isoWeekday(1).startOf('day').toDate();

    // Run all queries in parallel for better performance
    const [
      totalMeals,
      totalCategories,
      favoriteMeals,
      avgRatingResult,
      mealsWithRecipes,
      mealsWithoutRecipes,
      mealsByCategory,
      topRatedMeals,
      frequentMealsData,
      currentWeekPlan,
    ] = await Promise.all([
      // Total meals count
      prisma.meal.count(),

      // Total categories count
      prisma.category.count(),

      // Favorite meals (rating >= 4)
      prisma.meal.count({
        where: { rating: { gte: 4 } },
      }),

      // Average rating
      prisma.meal.aggregate({
        _avg: { rating: true },
      }),

      // Meals with recipes
      prisma.meal.count({
        where: {
          recipeText: { not: null },
          NOT: { recipeText: '' },
        },
      }),

      // Meals without recipes
      prisma.meal.count({
        where: {
          OR: [
            { recipeText: null },
            { recipeText: '' },
          ],
        },
      }),

      // Meals grouped by category
      prisma.meal.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),

      // Top rated meals (top 5)
      prisma.meal.findMany({
        take: 5,
        orderBy: { rating: 'desc' },
        include: {
          category: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      }),

      // Most frequently planned meals
      prisma.plannedMeal.groupBy({
        by: ['mealId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // Current week plan for coverage
      prisma.weeklyPlan.findUnique({
        where: { weekStartDate },
        include: {
          plannedMeals: true,
        },
      }),
    ]);

    // Fetch category details for groupBy results
    const categoryIds = mealsByCategory
      .map((item: { categoryId: number | null; _count: { id: number } }) => item.categoryId)
      .filter((id): id is number => id !== null);

    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

    // Map category details to meals by category
    const mealsByCategoryWithDetails = mealsByCategory.map((item: { categoryId: number | null; _count: { id: number } }) => {
      if (item.categoryId === null) {
        return {
          categoryId: null,
          categoryName: 'Uncategorized',
          categoryColor: null,
          count: item._count.id,
        };
      }

      const category = categories.find((cat: { id: number; name: string; color: string | null }) => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || null,
        count: item._count.id,
      };
    });

    // Fetch meal details for frequently planned meals
    const frequentMealIds = frequentMealsData.map((item: { mealId: number; _count: { id: number } }) => item.mealId);
    const frequentMealDetails = await prisma.meal.findMany({
      where: {
        id: { in: frequentMealIds },
      },
      include: {
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    const mostFrequentlyPlannedMeals = frequentMealsData.map((item: { mealId: number; _count: { id: number } }) => {
      const meal = frequentMealDetails.find((m: { id: number; title: string; imageUrl: string | null; category: { name: string; color: string | null } | null }) => m.id === item.mealId);
      return {
        mealId: item.mealId,
        title: meal?.title || 'Unknown',
        imageUrl: meal?.imageUrl || null,
        planCount: item._count.id,
        category: meal?.category || null,
      };
    });

    // Calculate current week coverage
    // Count unique days that have at least one meal
    const daysWithMeals = currentWeekPlan?.plannedMeals
      ? new Set(currentWeekPlan.plannedMeals.map(pm => pm.dayOfWeek)).size
      : 0;
    const totalDays = 7; // Monday-Sunday
    const filledSlots = daysWithMeals; // For backward compatibility with response structure
    const coveragePercentage = Math.round((daysWithMeals / totalDays) * 100);

    // Calculate recipe completion rate
    const recipeCompletionRate = totalMeals > 0
      ? Math.round((mealsWithRecipes / totalMeals) * 100)
      : 0;

    // Build response
    const response = {
      totalMeals,
      totalCategories,
      mealsByCategory: mealsByCategoryWithDetails,
      topRatedMeals: topRatedMeals.map((meal: { id: number; title: string; rating: number; imageUrl: string | null; category: { name: string; color: string | null } | null }) => ({
        id: meal.id,
        title: meal.title,
        rating: meal.rating,
        imageUrl: meal.imageUrl,
        category: meal.category,
      })),
      favoriteMeals,
      averageRating: avgRatingResult._avg.rating || 0,
      mealsWithRecipes,
      mealsWithoutRecipes,
      recipeCompletionRate,
      currentWeekCoverage: {
        totalSlots: totalDays, // Now represents total days (7)
        filledSlots: daysWithMeals, // Now represents days with meals (0-7)
        coveragePercentage,
      },
      mostFrequentlyPlannedMeals,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
