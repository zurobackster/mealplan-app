'use client';

import { Paper, Text, Stack, ScrollArea } from '@mantine/core';
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
    <Paper
      p="md"
      withBorder
      shadow="sm"
      style={{
        minWidth: 200,
        maxWidth: 220,
        flex: '0 0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        backgroundColor: '#fafafa',
        borderWidth: '1px',
        borderColor: '#e0e0e0',
      }}
    >
      {/* Day Header - Fixed */}
      <Text
        size="sm"
        fw={700}
        mb="md"
        ta="center"
        style={{
          padding: '8px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {dayName}
      </Text>

      {/* Scrollable Meal Slots */}
      <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars scrollbarSize={8}>
        <Stack gap="md" pr="xs">
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
      </ScrollArea>
    </Paper>
  );
}
