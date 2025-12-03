import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';
import { getMonday } from '@/lib/utils/date';
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Parse the date (use UTC to match database)
    const requestedDate = dayjs.utc(dateStr);
    if (!requestedDate.isValid()) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get the Monday of the week containing this date (calculate in UTC)
    const monday = requestedDate.isoWeekday(1).startOf('day').toDate();
    const dayOfWeek = requestedDate.isoWeekday(); // 1-7 (Monday=1)

    console.log('[Day Detail API] Request:', {
      requestedDate: dateStr,
      monday: dayjs.utc(monday).format('YYYY-MM-DD'),
      dayOfWeek,
    });

    // Find the weekly plan for this week
    const weeklyPlan = await prisma.weeklyPlan.findUnique({
      where: {
        weekStartDate: monday,
      },
      include: {
        plannedMeals: {
          where: {
            dayOfWeek: dayOfWeek,
          },
          include: {
            meal: {
              include: {
                category: {
                  select: {
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    console.log('[Day Detail API] Weekly plan found:', weeklyPlan ? {
      id: weeklyPlan.id,
      weekStartDate: dayjs.utc(weeklyPlan.weekStartDate).format('YYYY-MM-DD'),
      mealsForThisDay: weeklyPlan.plannedMeals.length,
    } : 'null');

    // Group meals by slot
    type PlannedMealWithMeal = {
      id: number;
      slot: string;
      meal: {
        id: number;
        title: string;
        rating: number;
        imageUrl: string | null;
        recipeText: string | null;
        category: { name: string; color: string | null } | null;
      };
    };

    const breakfast = weeklyPlan?.plannedMeals
      .filter((pm: PlannedMealWithMeal) => pm.slot === 'BREAKFAST')
      .map((pm: PlannedMealWithMeal) => ({
        id: pm.id,
        meal: {
          id: pm.meal.id,
          title: pm.meal.title,
          rating: pm.meal.rating,
          imageUrl: pm.meal.imageUrl,
          recipeText: pm.meal.recipeText,
          category: pm.meal.category,
        },
      })) || [];

    const lunch = weeklyPlan?.plannedMeals
      .filter((pm: PlannedMealWithMeal) => pm.slot === 'LUNCH')
      .map((pm: PlannedMealWithMeal) => ({
        id: pm.id,
        meal: {
          id: pm.meal.id,
          title: pm.meal.title,
          rating: pm.meal.rating,
          imageUrl: pm.meal.imageUrl,
          recipeText: pm.meal.recipeText,
          category: pm.meal.category,
        },
      })) || [];

    const dinner = weeklyPlan?.plannedMeals
      .filter((pm: PlannedMealWithMeal) => pm.slot === 'DINNER')
      .map((pm: PlannedMealWithMeal) => ({
        id: pm.id,
        meal: {
          id: pm.meal.id,
          title: pm.meal.title,
          rating: pm.meal.rating,
          imageUrl: pm.meal.imageUrl,
          recipeText: pm.meal.recipeText,
          category: pm.meal.category,
        },
      })) || [];

    const other = weeklyPlan?.plannedMeals
      .filter((pm: PlannedMealWithMeal) => pm.slot === 'OTHER')
      .map((pm: PlannedMealWithMeal) => ({
        id: pm.id,
        meal: {
          id: pm.meal.id,
          title: pm.meal.title,
          rating: pm.meal.rating,
          imageUrl: pm.meal.imageUrl,
          recipeText: pm.meal.recipeText,
          category: pm.meal.category,
        },
      })) || [];

    const response = {
      date: dateStr,
      dayOfWeek: dayOfWeek,
      meals: {
        breakfast,
        lunch,
        dinner,
        other,
      },
    };

    console.log('[Day Detail API] Response:', {
      date: dateStr,
      mealCounts: {
        breakfast: breakfast.length,
        lunch: lunch.length,
        dinner: dinner.length,
        other: other.length,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching day detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day detail' },
      { status: 500 }
    );
  }
}
