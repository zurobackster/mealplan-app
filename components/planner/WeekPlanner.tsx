'use client';

import { useState, useEffect } from 'react';
import { Stack, SimpleGrid, Loader, Center, Text } from '@mantine/core';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { notifications } from '@mantine/notifications';
import { WeekSelector } from './WeekSelector';
import { DayColumn } from './DayColumn';
import { getMonday, formatISODate } from '@/lib/utils/date';

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

export function WeekPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch weekly plan
  const fetchWeeklyPlan = async (date: Date) => {
    try {
      setLoading(true);
      const monday = getMonday(date);
      const weekStartDate = formatISODate(monday);

      const response = await fetch(`/api/weekly-plans?weekStartDate=${weekStartDate}`);
      if (response.ok) {
        const data = await response.json();
        setWeeklyPlan(data);
      }
    } catch (error) {
      console.error('Failed to fetch weekly plan:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load weekly plan',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyPlan(selectedDate);
  }, [selectedDate]);

  const handleRemoveMeal = async (plannedMealId: number) => {
    try {
      const response = await fetch(`/api/planned-meals/${plannedMealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Optimistic update
        setWeeklyPlan((prev) =>
          prev
            ? {
                ...prev,
                plannedMeals: prev.plannedMeals.filter((m) => m.id !== plannedMealId),
              }
            : null
        );
        notifications.show({
          title: 'Removed',
          message: 'Meal removed from plan',
          color: 'blue',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove meal',
        color: 'red',
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !weeklyPlan) return;

    const overId = over.id as string;

    // Check if dropped on a valid drop zone
    if (typeof overId === 'string' && overId.includes('-')) {
      const [dayOfWeek, slot] = overId.split('-');
      const plannedMealId = active.id as number;

      // Find the planned meal
      const plannedMeal = weeklyPlan.plannedMeals.find((m) => m.id === plannedMealId);
      if (!plannedMeal) return;

      // Check if it's the same slot
      if (
        plannedMeal.dayOfWeek === parseInt(dayOfWeek) &&
        plannedMeal.slot === slot
      ) {
        return; // No change
      }

      // Update on server
      try {
        const response = await fetch(`/api/planned-meals/${plannedMealId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayOfWeek: parseInt(dayOfWeek),
            slot,
          }),
        });

        if (response.ok) {
          // Refresh the plan
          fetchWeeklyPlan(selectedDate);
          notifications.show({
            title: 'Moved',
            message: 'Meal moved successfully',
            color: 'green',
          });
        }
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to move meal',
          color: 'red',
        });
      }
    }
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Stack gap="md" style={{ height: '100%' }}>
        <WeekSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <SimpleGrid cols={7} spacing="xs" style={{ flex: 1, overflow: 'auto' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
            <DayColumn
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              meals={weeklyPlan.plannedMeals.filter((m) => m.dayOfWeek === dayOfWeek)}
              onRemoveMeal={handleRemoveMeal}
            />
          ))}
        </SimpleGrid>
      </Stack>

      <DragOverlay>
        {activeId ? (
          <div style={{ opacity: 0.8 }}>
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
