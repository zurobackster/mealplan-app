import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';

// POST add meal to plan
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weeklyPlanId, mealId, dayOfWeek, slot, position } = body;

    // Validate required fields
    if (!weeklyPlanId || !mealId || !dayOfWeek || !slot) {
      return NextResponse.json(
        { error: 'weeklyPlanId, mealId, dayOfWeek, and slot are required' },
        { status: 400 }
      );
    }

    // Validate dayOfWeek (1-7)
    if (dayOfWeek < 1 || dayOfWeek > 7) {
      return NextResponse.json(
        { error: 'dayOfWeek must be between 1 and 7' },
        { status: 400 }
      );
    }

    // Validate slot
    const validSlots = ['BREAKFAST', 'LUNCH', 'DINNER', 'OTHER'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json(
        { error: 'Invalid slot. Must be BREAKFAST, LUNCH, DINNER, or OTHER' },
        { status: 400 }
      );
    }

    const plannedMeal = await prisma.plannedMeal.create({
      data: {
        weeklyPlanId,
        mealId,
        dayOfWeek,
        slot,
        position: position || 0,
      },
      include: {
        meal: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(plannedMeal, { status: 201 });
  } catch (error: any) {
    console.error('Create planned meal error:', error);

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid weeklyPlanId or mealId' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
