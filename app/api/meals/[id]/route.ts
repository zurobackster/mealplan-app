import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';

// PATCH update meal
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
    const mealId = parseInt(id);

    if (isNaN(mealId)) {
      return NextResponse.json({ error: 'Invalid meal ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, categoryId, rating, imageUrl, recipeText } = body;

    const meal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        ...(title !== undefined && { title }),
        ...(categoryId !== undefined && { categoryId }),
        ...(rating !== undefined && { rating }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(recipeText !== undefined && { recipeText }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(meal);
  } catch (error: any) {
    console.error('Update meal error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE meal (cascades to planned meals)
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
    const mealId = parseInt(id);

    if (isNaN(mealId)) {
      return NextResponse.json({ error: 'Invalid meal ID' }, { status: 400 });
    }

    // Delete all planned meals first (manual cascade)
    await prisma.plannedMeal.deleteMany({
      where: { mealId },
    });

    // Then delete the meal
    await prisma.meal.delete({
      where: { id: mealId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete meal error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
