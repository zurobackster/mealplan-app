'use client';

import { Stack, Text, Paper } from '@mantine/core';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';
import { PlannedMealCard } from './PlannedMealCard';

interface PlannedMeal {
  id: number;
  meal: {
    id: number;
    title: string;
    imageUrl: string | null;
    category?: {
      color: string | null;
    } | null;
  };
}

interface SlotDropZoneProps {
  dayOfWeek: number;
  slot: string;
  meals: PlannedMeal[];
  onRemoveMeal: (plannedMealId: number) => void;
}

export function SlotDropZone({
  dayOfWeek,
  slot,
  meals,
  onRemoveMeal,
}: SlotDropZoneProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const el = dropZoneRef.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      getData: () => ({ dayOfWeek, slot }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [dayOfWeek, slot]);

  const slotLabels: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    OTHER: 'Others',
  };

  return (
    <Paper
      ref={dropZoneRef}
      p="sm"
      withBorder
      style={{
        minHeight: 100,
        maxHeight: meals.length > 0 ? 'none' : 100,
        backgroundColor: isOver
          ? 'rgba(92, 124, 250, 0.08)'
          : meals.length > 0
          ? 'white'
          : 'rgba(248, 249, 250, 0.5)',
        borderStyle: meals.length > 0 ? 'solid' : 'dashed',
        borderColor: isOver ? '#5c7cfa' : meals.length > 0 ? '#e9ecef' : '#ced4da',
        borderWidth: 2,
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        boxShadow: isOver ? '0 2px 8px rgba(92, 124, 250, 0.15)' : 'none',
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
            Drop meal here
          </Text>
        ) : (
          meals.map((plannedMeal) => (
            <PlannedMealCard
              key={plannedMeal.id}
              id={plannedMeal.id}
              title={plannedMeal.meal.title}
              imageUrl={plannedMeal.meal.imageUrl}
              categoryColor={plannedMeal.meal.category?.color}
              dayOfWeek={dayOfWeek}
              slot={slot}
              onRemove={() => onRemoveMeal(plannedMeal.id)}
            />
          ))
        )}
      </Stack>
    </Paper>
  );
}
