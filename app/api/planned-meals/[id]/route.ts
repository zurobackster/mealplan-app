import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';

// PATCH update planned meal (for reordering or moving between slots)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const plannedMealId = parseInt(id);

    if (isNaN(plannedMealId)) {
      return NextResponse.json(
        { error: 'Invalid planned meal ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { dayOfWeek, slot, position } = body;

    // Validate dayOfWeek if provided
    if (dayOfWeek !== undefined && (dayOfWeek < 1 || dayOfWeek > 7)) {
      return NextResponse.json(
        { error: 'dayOfWeek must be between 1 and 7' },
        { status: 400 }
      );
    }

    // Validate slot if provided
    if (slot !== undefined) {
      const validSlots = ['BREAKFAST', 'LUNCH', 'DINNER', 'OTHER'];
      if (!validSlots.includes(slot)) {
        return NextResponse.json(
          { error: 'Invalid slot' },
          { status: 400 }
        );
      }
    }

    const plannedMeal = await prisma.plannedMeal.update({
      where: { id: plannedMealId },
      data: {
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(slot !== undefined && { slot }),
        ...(position !== undefined && { position }),
      },
      include: {
        meal: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(plannedMeal);
  } catch (error: any) {
    console.error('Update planned meal error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Planned meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE remove planned meal from plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const plannedMealId = parseInt(id);

    if (isNaN(plannedMealId)) {
      return NextResponse.json(
        { error: 'Invalid planned meal ID' },
        { status: 400 }
      );
    }

    await prisma.plannedMeal.delete({
      where: { id: plannedMealId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete planned meal error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Planned meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
