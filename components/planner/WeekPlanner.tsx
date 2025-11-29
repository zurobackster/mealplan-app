'use client';

import { Stack, Loader, Center, Text, ScrollArea, Flex } from '@mantine/core';
import { WeekSelector } from './WeekSelector';
import { DayColumn } from './DayColumn';

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
    imageUrl: string | null;
    category?: {
      color: string | null;
    } | null;
  };
}

interface WeekPlannerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  weeklyPlan: WeeklyPlan | null;
  loading: boolean;
  onRemoveMeal: (plannedMealId: number) => void;
  scrollViewportRef?: React.RefObject<HTMLDivElement | null>;
}

export function WeekPlanner({
  selectedDate,
  onDateChange,
  weeklyPlan,
  loading,
  onRemoveMeal,
  scrollViewportRef,
}: WeekPlannerProps) {

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

  return (
    <Stack gap="md" style={{ height: '100%', overflow: 'hidden' }}>
      <WeekSelector selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* Horizontal ScrollArea for day columns */}
      <ScrollArea viewportRef={scrollViewportRef} style={{ flex: 1 }} type="auto" offsetScrollbars scrollbarSize={10}>
        <Flex direction="row" wrap="nowrap" gap="md" style={{ height: '100%', minWidth: 'min-content' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
            <DayColumn
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              meals={weeklyPlan.plannedMeals.filter((m) => m.dayOfWeek === dayOfWeek)}
              onRemoveMeal={onRemoveMeal}
            />
          ))}
        </Flex>
      </ScrollArea>
    </Stack>
  );
}
