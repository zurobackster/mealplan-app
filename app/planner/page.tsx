'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Group, Box, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MealListPanel } from '@/components/meals/MealListPanel';
import { CategoryManagerModal } from '@/components/modals/CategoryManagerModal';
import { MealEditorModal } from '@/components/modals/MealEditorModal';
import { ImageCropperModal } from '@/components/modals/ImageCropperModal';
import { WeekPlanner } from '@/components/planner/WeekPlanner';

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
        {/* Left Panel - Meal Catalog (60%) */}
        <Box style={{ width: '60%', borderRight: '1px solid #dee2e6' }}>
          <MealListPanel
            key={mealListKey}
            onEditMeal={handleOpenMealEditor}
            onCreateMeal={() => handleOpenMealEditor()}
            onManageCategories={() => setCategoryModalOpened(true)}
          />
        </Box>

        {/* Right Panel - Weekly Planner (40%) */}
        <Box style={{ width: '40%', overflow: 'hidden' }}>
          <WeekPlanner />
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
