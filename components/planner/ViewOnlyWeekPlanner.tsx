'use client';

import { Stack, Loader, Center, Text, Flex } from '@mantine/core';
import { WeekSelector } from './WeekSelector';
import { ViewOnlyDayColumn } from './ViewOnlyDayColumn';
import { getMonday } from '@/lib/utils/date';

interface WeeklyPlan {
  id: number;
  plannedMeals: PlannedMeal[];
}

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

interface ViewOnlyWeekPlannerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  weeklyPlan: WeeklyPlan | null;
  loading: boolean;
}

export function ViewOnlyWeekPlanner({
  selectedDate,
  onDateChange,
  weeklyPlan,
  loading,
}: ViewOnlyWeekPlannerProps) {
  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!weeklyPlan) {
    return (
      <Center h={400}>
        <Text c="dimmed">Failed to load weekly plan</Text>
      </Center>
    );
  }

  const monday = getMonday(selectedDate);

  return (
    <Stack gap="md" style={{ height: '100%', overflow: 'hidden' }}>
      <WeekSelector selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* Horizontal scroll with native CSS overflow */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Flex direction="row" wrap="nowrap" gap="md" style={{ height: '100%', minWidth: 'min-content' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
            <ViewOnlyDayColumn
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              monday={monday}
              meals={weeklyPlan.plannedMeals.filter((m) => m.dayOfWeek === dayOfWeek)}
            />
          ))}
        </Flex>
      </div>
    </Stack>
  );
}
