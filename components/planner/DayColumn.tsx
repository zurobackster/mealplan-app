'use client';

import { Paper, Text, Stack } from '@mantine/core';
import { SlotDropZone } from './SlotDropZone';
import { getDayName } from '@/lib/utils/date';

interface PlannedMeal {
  id: number;
  dayOfWeek: number;
  slot: string;
  meal: {
    id: number;
    title: string;
    imageUrl: string | null;
    category?: {
      color: string | null;
    } | null;
  };
}

interface DayColumnProps {
  dayOfWeek: number;
  meals: PlannedMeal[];
  onRemoveMeal: (plannedMealId: number) => void;
}

const SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER', 'OTHER'];

export function DayColumn({ dayOfWeek, meals, onRemoveMeal }: DayColumnProps) {
  const dayName = getDayName(dayOfWeek);

  const getMealsForSlot = (slot: string) => {
    return meals
      .filter((m) => m.dayOfWeek === dayOfWeek && m.slot === slot)
      .sort((a, b) => (a.id - b.id)); // Sort by position if needed
  };

  return (
    <Paper p="sm" withBorder style={{ height: '100%' }}>
      <Text size="sm" fw={700} mb="md" ta="center">
        {dayName}
      </Text>
      <Stack gap="sm">
        {SLOTS.map((slot) => (
          <SlotDropZone
            key={slot}
            dayOfWeek={dayOfWeek}
            slot={slot}
            meals={getMealsForSlot(slot)}
            onRemoveMeal={onRemoveMeal}
          />
        ))}
      </Stack>
    </Paper>
  );
}
