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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const yearStr = searchParams.get('year');
    const monthStr = searchParams.get('month');

    if (!yearStr || !monthStr) {
      return NextResponse.json(
        { error: 'Year and month parameters are required' },
        { status: 400 }
      );
    }

    const year = parseInt(yearStr);
    const month = parseInt(monthStr); // 1-12

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month parameter' },
        { status: 400 }
      );
    }

    // Calculate the date range for the month (use UTC to match database)
    const firstDay = dayjs.utc(`${year}-${String(month).padStart(2, '0')}-01`);
    const lastDay = firstDay.endOf('month');

    // Find the Monday of the first week and Sunday of the last week
    // (since calendar might show days from adjacent months)
    const startDay = firstDay.isoWeekday(1).startOf('day'); // Monday
    const endDay = lastDay.isoWeekday(7).endOf('day'); // Sunday

    console.log('[Calendar API] Date range:', {
      month: `${year}-${month}`,
      startDay: startDay.format('YYYY-MM-DD'),
      endDay: endDay.format('YYYY-MM-DD'),
    });

    // Get all weekly plans that intersect with this calendar view
    const weeklyPlans = await prisma.weeklyPlan.findMany({
      where: {
        weekStartDate: {
          gte: startDay.toDate(),
          lte: endDay.toDate(),
        },
      },
      include: {
        plannedMeals: {
          select: {
            dayOfWeek: true,
            slot: true,
          },
        },
      },
    });

    console.log('[Calendar API] Found weekly plans:', weeklyPlans.length, weeklyPlans.map(p => ({
      weekStartDate: dayjs.utc(p.weekStartDate).format('YYYY-MM-DD'),
      mealsCount: p.plannedMeals.length,
    })));

    // Build a map of date => meal indicators
    const daysWithMealsMap = new Map<string, {
      date: string;
      mealCount: number;
      hasBreakfast: boolean;
      hasLunch: boolean;
      hasDinner: boolean;
      hasOther: boolean;
    }>();

    // Process each weekly plan
    for (const plan of weeklyPlans) {
      const weekStart = dayjs.utc(plan.weekStartDate);

      // For each day of the week (1-7, Monday=1)
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const currentDay = weekStart.add(dayOfWeek - 1, 'day');
        const dateString = currentDay.format('YYYY-MM-DD');

        // Only include days within our calendar view (use day-level granularity)
        if (currentDay.isBefore(startDay, 'day') || currentDay.isAfter(endDay, 'day')) {
          continue;
        }

        // Get meals for this specific day
        const mealsForDay = plan.plannedMeals.filter(
          (pm: { dayOfWeek: number; slot: string }) => pm.dayOfWeek === dayOfWeek
        );

        if (mealsForDay.length > 0) {
          const hasBreakfast = mealsForDay.some((pm: { slot: string }) => pm.slot === 'BREAKFAST');
          const hasLunch = mealsForDay.some((pm: { slot: string }) => pm.slot === 'LUNCH');
          const hasDinner = mealsForDay.some((pm: { slot: string }) => pm.slot === 'DINNER');
          const hasOther = mealsForDay.some((pm: { slot: string }) => pm.slot === 'OTHER');

          daysWithMealsMap.set(dateString, {
            date: dateString,
            mealCount: mealsForDay.length,
            hasBreakfast,
            hasLunch,
            hasDinner,
            hasOther,
          });
        }
      }
    }

    // Convert map to array
    const daysWithMeals = Array.from(daysWithMealsMap.values());

    console.log('[Calendar API] Days with meals:', daysWithMeals.map(d => d.date).join(', '));

    const response = {
      year,
      month,
      daysWithMeals,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
