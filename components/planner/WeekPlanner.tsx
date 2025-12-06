'use client';

import { useEffect } from 'react';
import { Stack, Loader, Center, Text, Flex } from '@mantine/core';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { WeekSelector } from './WeekSelector';
import { DayColumn } from './DayColumn';
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

  // Auto-scroll for horizontal scrolling
  useEffect(() => {
    const scrollContainer = scrollViewportRef?.current;
    if (!scrollContainer) return;

    return autoScrollForElements({
      element: scrollContainer,
    });
  }, [scrollViewportRef]);

  // Mouse wheel horizontal scroll
  useEffect(() => {
    const container = scrollViewportRef?.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Convert vertical wheel scroll to horizontal scroll
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scrollViewportRef]);

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
        ref={scrollViewportRef}
        className="horizontal-scroll-container"
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Flex direction="row" wrap="nowrap" gap="md" style={{ height: '100%', minWidth: 'min-content' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
            <DayColumn
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              monday={monday}
              meals={weeklyPlan.plannedMeals.filter((m) => m.dayOfWeek === dayOfWeek)}
              onRemoveMeal={onRemoveMeal}
            />
          ))}
        </Flex>
      </div>
    </Stack>
  );
}
