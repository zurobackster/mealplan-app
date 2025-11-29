'use client';

import { Paper, Text, Stack } from '@mantine/core';
import { ViewOnlySlotZone } from './ViewOnlySlotZone';
import { formatDayHeader } from '@/lib/utils/date';

interface PlannedMeal {
  id: number;
  dayOfWeek: number;
  slot: string;
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

interface ViewOnlyDayColumnProps {
  dayOfWeek: number;
  monday: Date;
  meals: PlannedMeal[];
}

const SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER', 'OTHER'];

export function ViewOnlyDayColumn({ dayOfWeek, monday, meals }: ViewOnlyDayColumnProps) {
  const dayHeader = formatDayHeader(monday, dayOfWeek);

  const getMealsForSlot = (slot: string) => {
    return meals
      .filter((m) => m.dayOfWeek === dayOfWeek && m.slot === slot)
      .sort((a, b) => (a.id - b.id));
  };

  return (
    <Paper
      p="md"
      withBorder
      shadow="sm"
      style={{
        minWidth: 260,
        maxWidth: 286,
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
        {dayHeader}
      </Text>

      {/* Scrollable Meal Slots */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        <Stack gap="md">
          {SLOTS.map((slot) => (
            <ViewOnlySlotZone
              key={slot}
              slot={slot}
              meals={getMealsForSlot(slot)}
            />
          ))}
        </Stack>
      </div>
    </Paper>
  );
}
