'use client';

import { Stack, Text, Paper } from '@mantine/core';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  const dropId = `${dayOfWeek}-${slot}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  const slotLabels: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    OTHER: 'Others',
  };

  return (
    <Paper
      ref={setNodeRef}
      p="xs"
      withBorder
      style={{
        minHeight: 80,
        backgroundColor: isOver ? '#f0f0ff' : 'white',
        borderStyle: 'dashed',
        borderColor: isOver ? '#5c7cfa' : '#dee2e6',
        borderWidth: 2,
        transition: 'all 0.2s',
      }}
    >
      <Text size="xs" fw={600} c="dimmed" mb="xs">
        {slotLabels[slot] || slot}
      </Text>
      <SortableContext
        items={meals.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack gap="xs">
          {meals.map((plannedMeal) => (
            <PlannedMealCard
              key={plannedMeal.id}
              id={plannedMeal.id}
              title={plannedMeal.meal.title}
              imageUrl={plannedMeal.meal.imageUrl}
              categoryColor={plannedMeal.meal.category?.color}
              onRemove={() => onRemoveMeal(plannedMeal.id)}
            />
          ))}
        </Stack>
      </SortableContext>
    </Paper>
  );
}
