import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';

// GET weekly plan by weekStartDate (auto-create if missing)
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get('weekStartDate');

    if (!weekStartDate) {
      return NextResponse.json(
        { error: 'weekStartDate is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Frontend already sends Monday - use it directly with explicit UTC
    const startDate = new Date(weekStartDate + 'T00:00:00.000Z');

    // Try to find existing plan
    let weeklyPlan = await prisma.weeklyPlan.findUnique({
      where: { weekStartDate: startDate },
      include: {
        plannedMeals: {
          include: {
            meal: {
              include: {
                category: true,
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { slot: 'asc' },
            { position: 'asc' },
          ],
        },
      },
    });

    // Create if doesn't exist
    if (!weeklyPlan) {
      weeklyPlan = await prisma.weeklyPlan.create({
        data: {
          weekStartDate: startDate,
        },
        include: {
          plannedMeals: {
            include: {
              meal: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(weeklyPlan);
  } catch (error) {
    console.error('Get weekly plan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new weekly plan
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
    const { weekStartDate } = body;

    if (!weekStartDate) {
      return NextResponse.json(
        { error: 'weekStartDate is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Frontend already sends Monday - use it directly with explicit UTC
    const startDate = new Date(weekStartDate + 'T00:00:00.000Z');

    const weeklyPlan = await prisma.weeklyPlan.create({
      data: {
        weekStartDate: startDate,
      },
      include: {
        plannedMeals: true,
      },
    });

    return NextResponse.json(weeklyPlan, { status: 201 });
  } catch (error: any) {
    console.error('Create weekly plan error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Weekly plan already exists for this date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
