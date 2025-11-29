'use client';

import { Stack, Text, Paper } from '@mantine/core';
import { ViewOnlyMealCard } from './ViewOnlyMealCard';

interface PlannedMeal {
  id: number;
  meal: {
    id: number;
    title: string;
    rating: number;
    imageUrl: string | null;
    category?: {
      color: string | null;
    } | null;
  };
}

interface ViewOnlySlotZoneProps {
  slot: string;
  meals: PlannedMeal[];
}

export function ViewOnlySlotZone({
  slot,
  meals,
}: ViewOnlySlotZoneProps) {
  const slotLabels: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    OTHER: 'Others',
  };

  return (
    <Paper
      p="sm"
      withBorder
      style={{
        minHeight: 100,
        maxHeight: meals.length > 0 ? 'none' : 100,
        backgroundColor: meals.length > 0 ? 'white' : 'rgba(248, 249, 250, 0.5)',
        borderStyle: meals.length > 0 ? 'solid' : 'dashed',
        borderColor: meals.length > 0 ? '#e9ecef' : '#ced4da',
        borderWidth: 2,
        borderRadius: '8px',
      }}
    >
      <Text
        size="xs"
        fw={600}
        c={meals.length > 0 ? 'gray.7' : 'dimmed'}
        mb={meals.length > 0 ? 'xs' : 0}
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {slotLabels[slot] || slot}
      </Text>

      <Stack gap="xs">
        {meals.length === 0 ? (
          <Text size="xs" c="dimmed" ta="center" py="sm">
            No meals planned
          </Text>
        ) : (
          meals.map((plannedMeal) => (
            <ViewOnlyMealCard
              key={plannedMeal.id}
              title={plannedMeal.meal.title}
              rating={plannedMeal.meal.rating}
              imageUrl={plannedMeal.meal.imageUrl}
              categoryColor={plannedMeal.meal.category?.color}
            />
          ))
        )}
      </Stack>
    </Paper>
  );
}
