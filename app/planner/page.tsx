'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { MealListPanel } from '@/components/meals/MealListPanel';
import { CategoryManagerModal } from '@/components/modals/CategoryManagerModal';
import { MealEditorModal } from '@/components/modals/MealEditorModal';
import { ImageCropperModal } from '@/components/modals/ImageCropperModal';
import { WeekPlanner } from '@/components/planner/WeekPlanner';
import { getMonday, formatISODate } from '@/lib/utils/date';

interface Meal {
  id: number;
  title: string;
  rating: number;
  imageUrl: string | null;
  recipeText: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
}

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

export default function PlannerPage() {
  const [loading, setLoading] = useState(true);

  // Modal states
  const [categoryModalOpened, setCategoryModalOpened] = useState(false);
  const [mealEditorOpened, setMealEditorOpened] = useState(false);
  const [imageCropperOpened, setImageCropperOpened] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [imageCropperCallback, setImageCropperCallback] = useState<((url: string) => void) | null>(null);
  const [mealListKey, setMealListKey] = useState(0);

  // Drag-and-drop state
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeMeal, setActiveMeal] = useState<any | null>(null);


  // Weekly planner state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(true);

  // Scroll preservation refs
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.isLoggedIn) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch weekly plan (with loading indicator)
  const fetchWeeklyPlan = async (date: Date) => {
    try {
      setPlannerLoading(true);
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
      setPlannerLoading(false);
    }
  };

  // Refresh weekly plan in background (no loading indicator - for SPA behavior)
  const refreshWeeklyPlan = async (date: Date) => {
    try {
      const monday = getMonday(date);
      const weekStartDate = formatISODate(monday);

      const response = await fetch(`/api/weekly-plans?weekStartDate=${weekStartDate}`);
      if (response.ok) {
        const data = await response.json();
        setWeeklyPlan(data);
      }
    } catch (error) {
      console.error('Failed to refresh weekly plan:', error);
    }
  };

  useEffect(() => {
    fetchWeeklyPlan(selectedDate);
  }, [selectedDate]);

  // Restore scroll position after weeklyPlan updates
  useEffect(() => {
    if (scrollViewportRef.current && scrollPositionRef.current) {
      scrollViewportRef.current.scrollLeft = scrollPositionRef.current.x;
      scrollViewportRef.current.scrollTop = scrollPositionRef.current.y;
    }
  }, [weeklyPlan]);

  // Pragmatic Drag and Drop monitor
  useEffect(() => {
    return monitorForElements({
      onDragStart: ({ source }) => {
        setActiveId(source.data.id as number);
        setActiveMeal(source.data);
      },

      onDrop: async ({ source, location }) => {
        setActiveId(null);
        setActiveMeal(null);

        const target = location.current.dropTargets[0];
        if (!target || !weeklyPlan) return;

        const sourceData = source.data;
        const targetData = target.data;

        // Save scroll position before API call
        if (scrollViewportRef.current) {
          scrollPositionRef.current = {
            x: scrollViewportRef.current.scrollLeft,
            y: scrollViewportRef.current.scrollTop,
          };
        }

        // Case 1: Dropping catalog meal onto slot
        if (sourceData.type === 'catalog-meal' && targetData.dayOfWeek) {
          const mealId = sourceData.id as number;
          const { dayOfWeek, slot } = targetData;

          try {
            const response = await fetch('/api/planned-meals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                weeklyPlanId: weeklyPlan.id,
                mealId,
                dayOfWeek,
                slot,
                position: 0,
              }),
            });

            if (response.ok) {
              refreshWeeklyPlan(selectedDate);
              notifications.show({
                title: 'Added',
                message: 'Meal added to plan',
                color: 'green',
              });
            }
          } catch (error) {
            notifications.show({
              title: 'Error',
              message: 'Failed to add meal',
              color: 'red',
            });
          }
        }

        // Case 2: Moving planned meal between slots or reordering
        else if (sourceData.type === 'planned-meal') {
          const plannedMealId = sourceData.id as number;

          // Determine target position
          let targetDayOfWeek, targetSlot;

          if (targetData.type === 'planned-meal') {
            // Dropped on another planned meal (reordering)
            targetDayOfWeek = targetData.dayOfWeek;
            targetSlot = targetData.slot;

            // Use closest edge for positioning (future enhancement)
            const edge = extractClosestEdge(targetData);
            // Position based on edge (top or bottom) - for now, just move to that slot
          } else {
            // Dropped on empty slot
            targetDayOfWeek = targetData.dayOfWeek;
            targetSlot = targetData.slot;
          }

          // Check if it's the same slot
          if (
            sourceData.dayOfWeek === targetDayOfWeek &&
            sourceData.slot === targetSlot
          ) {
            return; // No change
          }

          try {
            const response = await fetch(`/api/planned-meals/${plannedMealId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dayOfWeek: targetDayOfWeek,
                slot: targetSlot,
              }),
            });

            if (response.ok) {
              refreshWeeklyPlan(selectedDate);
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
      },
    });
  }, [weeklyPlan, selectedDate]);

  const handleRemoveMeal = async (plannedMealId: number) => {
    try {
      const response = await fetch(`/api/planned-meals/${plannedMealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshWeeklyPlan(selectedDate);
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

  const handleOpenMealEditor = (meal?: Meal) => {
    setEditingMeal(meal || null);
    setMealEditorOpened(true);
  };

  const handleMealSaved = () => {
    setMealListKey((prev) => prev + 1);
    refreshWeeklyPlan(selectedDate);
  };

  const handleOpenImageCropper = (callback: (url: string) => void) => {
    setImageCropperCallback(() => callback);
    setImageCropperOpened(true);
  };

  const handleImageCropped = (url: string) => {
    if (imageCropperCallback) {
      imageCropperCallback(url);
    }
  };

  if (loading) {
    return (
      <Box p="xl">
        <Text ta="center">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Main Content - Split View */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Meal Catalog (50%) */}
          <Box style={{ width: '50%', borderRight: '1px solid #dee2e6' }}>
            <MealListPanel
              key={mealListKey}
              onEditMeal={handleOpenMealEditor}
              onCreateMeal={() => handleOpenMealEditor()}
              onManageCategories={() => setCategoryModalOpened(true)}
              onMealDeleted={handleMealSaved}
            />
          </Box>

          {/* Right Panel - Weekly Planner (50%) */}
          <Box
            style={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: '16px',
              backgroundColor: '#f8f9fa',
            }}
          >
            <WeekPlanner
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              weeklyPlan={weeklyPlan}
              loading={plannerLoading}
              onRemoveMeal={handleRemoveMeal}
              scrollViewportRef={scrollViewportRef}
            />
          </Box>
        </Box>

      {/* Modals */}
      <CategoryManagerModal
        opened={categoryModalOpened}
        onClose={() => setCategoryModalOpened(false)}
        onCategoriesUpdated={handleMealSaved}
      />

      <MealEditorModal
        opened={mealEditorOpened}
        onClose={() => setMealEditorOpened(false)}
        meal={editingMeal}
        onMealSaved={handleMealSaved}
        onOpenImageCropper={handleOpenImageCropper}
      />

      <ImageCropperModal
        opened={imageCropperOpened}
        onClose={() => setImageCropperOpened(false)}
        onImageCropped={handleImageCropped}
      />
    </Box>
  );
}
