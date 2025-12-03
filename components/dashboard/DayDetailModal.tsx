'use client';

import { Modal, Stack, Text, Loader, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ViewOnlySlotZone } from '@/components/planner/ViewOnlySlotZone';
import { formatDateLong } from '@/lib/utils/calendar';

interface PlannedMeal {
  id: number;
  meal: {
    id: number;
    title: string;
    rating: number;
    imageUrl: string | null;
    category: {
      name: string;
      color: string | null;
    } | null;
  };
}

interface DayDetailData {
  date: string;
  dayOfWeek: number;
  meals: {
    breakfast: PlannedMeal[];
    lunch: PlannedMeal[];
    dinner: PlannedMeal[];
    other: PlannedMeal[];
  };
}

interface DayDetailModalProps {
  opened: boolean;
  onClose: () => void;
  date: string | null; // YYYY-MM-DD
}

export function DayDetailModal({ opened, onClose, date }: DayDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DayDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened && date) {
      setLoading(true);
      setError(null);

      fetch(`/api/dashboard/day-detail?date=${date}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch day details');
          return res.json();
        })
        .then((data) => {
          console.log('[Day Detail Modal] Received data:', data);
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching day details:', err);
          setError('Failed to load meal plan for this day');
          setLoading(false);
        });
    }
  }, [opened, date]);

  const totalMeals =
    (data?.meals.breakfast.length || 0) +
    (data?.meals.lunch.length || 0) +
    (data?.meals.dinner.length || 0) +
    (data?.meals.other.length || 0);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text size="lg" fw={700}>
            {date ? formatDateLong(date) : 'Meal Plan'}
          </Text>
          {data && (
            <Text size="sm" c="dimmed">
              {totalMeals} meal{totalMeals !== 1 ? 's' : ''} planned
            </Text>
          )}
        </div>
      }
      size="lg"
      centered
    >
      {loading && (
        <Center py="xl">
          <Loader color="green" />
        </Center>
      )}

      {error && (
        <Center py="xl">
          <Text c="red">{error}</Text>
        </Center>
      )}

      {!loading && !error && data && (
        <Stack gap="md">
          {/* Breakfast */}
          <ViewOnlySlotZone
            slot="BREAKFAST"
            meals={data.meals.breakfast.map((pm) => ({
              id: pm.id,
              meal: {
                id: pm.meal.id,
                title: pm.meal.title,
                rating: pm.meal.rating,
                imageUrl: pm.meal.imageUrl,
                category: pm.meal.category,
              },
            }))}
          />

          {/* Lunch */}
          <ViewOnlySlotZone
            slot="LUNCH"
            meals={data.meals.lunch.map((pm) => ({
              id: pm.id,
              meal: {
                id: pm.meal.id,
                title: pm.meal.title,
                rating: pm.meal.rating,
                imageUrl: pm.meal.imageUrl,
                category: pm.meal.category,
              },
            }))}
          />

          {/* Dinner */}
          <ViewOnlySlotZone
            slot="DINNER"
            meals={data.meals.dinner.map((pm) => ({
              id: pm.id,
              meal: {
                id: pm.meal.id,
                title: pm.meal.title,
                rating: pm.meal.rating,
                imageUrl: pm.meal.imageUrl,
                category: pm.meal.category,
              },
            }))}
          />

          {/* Others */}
          <ViewOnlySlotZone
            slot="OTHER"
            meals={data.meals.other.map((pm) => ({
              id: pm.id,
              meal: {
                id: pm.meal.id,
                title: pm.meal.title,
                rating: pm.meal.rating,
                imageUrl: pm.meal.imageUrl,
                category: pm.meal.category,
              },
            }))}
          />

          {totalMeals === 0 && (
            <Center py="xl">
              <Text c="dimmed">No meals planned for this day</Text>
            </Center>
          )}
        </Stack>
      )}
    </Modal>
  );
}
