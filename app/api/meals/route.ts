import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';

// GET all meals (with optional category filter)
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
    const categoryId = searchParams.get('categoryId');

    const meals = await prisma.meal.findMany({
      where: categoryId
        ? { categoryId: parseInt(categoryId) }
        : undefined,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new meal
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
    const { title, categoryId, rating, imageUrl, recipeText } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Meal title is required' },
        { status: 400 }
      );
    }

    const meal = await prisma.meal.create({
      data: {
        title,
        categoryId: categoryId || null,
        rating: rating || 0,
        imageUrl: imageUrl || null,
        recipeText: recipeText || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
