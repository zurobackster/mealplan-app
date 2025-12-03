'use client';

import { Card, Image, Text, Badge, Rating, SimpleGrid, Stack } from '@mantine/core';

interface TopMeal {
  id: number;
  title: string;
  rating: number;
  imageUrl: string | null;
  category: {
    name: string;
    color: string | null;
  } | null;
}

interface TopMealsGridProps {
  meals: TopMeal[];
}

export function TopMealsGrid({ meals }: TopMealsGridProps) {
  if (meals.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No meals yet. Start by adding meals to your collection!
      </Text>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 5 }}
      spacing="md"
    >
      {meals.map((meal) => (
        <Card
          key={meal.id}
          padding="0"
          radius={12}
          withBorder
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <Image
                src={meal.imageUrl || '/uploads/placeholder.jpg'}
                alt={meal.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                fallbackSrc="https://placehold.co/200x200/e0e0e0/666666?text=No+Image"
              />
            </div>
            {meal.category && (
              <Badge
                color={meal.category.color || 'gray'}
                variant="filled"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                {meal.category.name}
              </Badge>
            )}
          </div>

          {/* Info */}
          <Stack gap="xs" p="sm">
            <Text
              size="sm"
              fw={600}
              lineClamp={2}
              style={{ minHeight: '2.6em', lineHeight: 1.3 }}
            >
              {meal.title}
            </Text>
            <Rating
              value={meal.rating}
              readOnly
              size="xs"
              color="yellow"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(251, 192, 45, 0.3))'
              }}
            />
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
