import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';
import { deleteImageFile } from '@/lib/utils/upload';

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

    // First, fetch current meal to get old imageUrl
    const currentMeal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!currentMeal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

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

    // If imageUrl changed, delete old image
    if (
      imageUrl !== undefined &&
      currentMeal.imageUrl &&
      currentMeal.imageUrl !== imageUrl
    ) {
      await deleteImageFile(currentMeal.imageUrl);
    }

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

    // First, fetch the meal to get imageUrl
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Delete all planned meals first (manual cascade)
    await prisma.plannedMeal.deleteMany({
      where: { mealId },
    });

    // Then delete the meal
    await prisma.meal.delete({
      where: { id: mealId },
    });

    // Delete image file if it exists
    if (meal.imageUrl) {
      await deleteImageFile(meal.imageUrl);
    }

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
