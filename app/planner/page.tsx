'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Group, Box, Paper, Card } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
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
    imageUrl: string | null;
    category?: {
      color: string | null;
    } | null;
  };
}

export default function PlannerPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.isLoggedIn) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch weekly plan
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

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as number);
    setActiveMeal(active.data.current);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveMeal(null);

    if (!over || !weeklyPlan) return;

    const overId = over.id as string;

    // Check if dropping on planner slot (format: "dayOfWeek-slot")
    if (typeof overId === 'string' && overId.includes('-')) {
      const [dayOfWeek, slot] = overId.split('-');
      const mealId = active.id as number;

      // Save scroll position before API call
      if (scrollViewportRef.current) {
        scrollPositionRef.current = {
          x: scrollViewportRef.current.scrollLeft,
          y: scrollViewportRef.current.scrollTop,
        };
      }

      // Determine if this is from catalog or within planner
      const isFromCatalog = active.data.current?.type === 'catalog-meal';

      if (isFromCatalog) {
        // Add meal to planner via POST /api/planned-meals
        try {
          const monday = getMonday(selectedDate);
          const weekStartDate = formatISODate(monday);

          // Get weekly plan (it should exist from fetch, but ensure it)
          const response = await fetch('/api/planned-meals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weeklyPlanId: weeklyPlan.id,
              mealId,
              dayOfWeek: parseInt(dayOfWeek),
              slot,
              position: 0,
            }),
          });

          if (response.ok) {
            fetchWeeklyPlan(selectedDate);
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
      } else {
        // Move existing planned meal
        const plannedMeal = weeklyPlan.plannedMeals.find((m) => m.id === mealId);
        if (!plannedMeal) return;

        // Check if it's the same slot
        if (
          plannedMeal.dayOfWeek === parseInt(dayOfWeek) &&
          plannedMeal.slot === slot
        ) {
          return; // No change
        }

        try {
          const response = await fetch(`/api/planned-meals/${mealId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayOfWeek: parseInt(dayOfWeek),
              slot,
            }),
          });

          if (response.ok) {
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
    }
  };

  const handleRemoveMeal = async (plannedMealId: number) => {
    try {
      const response = await fetch(`/api/planned-meals/${plannedMealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWeeklyPlan(selectedDate);
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      notifications.show({
        title: 'Logged Out',
        message: 'You have been logged out successfully',
        color: 'blue',
      });
      router.push('/login');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to log out',
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
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper p="md" shadow="sm">
          <Group justify="space-between">
            <div>
              <Text size="xl" fw={700}>
                Meal Planner
              </Text>
              {user && (
                <Text c="dimmed" size="sm">
                  Welcome, {user.username}
                </Text>
              )}
            </div>
            <Button onClick={handleLogout} variant="outline" color="red" size="sm">
              Logout
            </Button>
          </Group>
        </Paper>

        {/* Main Content - Split View */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Meal Catalog (50%) */}
          <Box style={{ width: '50%', borderRight: '1px solid #dee2e6' }}>
            <MealListPanel
              key={mealListKey}
              onEditMeal={handleOpenMealEditor}
              onCreateMeal={() => handleOpenMealEditor()}
              onManageCategories={() => setCategoryModalOpened(true)}
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

      {/* Drag Overlay */}
      <DragOverlay>
        {activeMeal ? (
          <Card shadow="lg" p="sm" style={{ opacity: 0.9, cursor: 'grabbing' }}>
            <Text size="sm" fw={500}>
              {activeMeal.title || 'Moving meal...'}
            </Text>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
