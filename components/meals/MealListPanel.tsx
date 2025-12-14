'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  Button,
  Group,
  Text,
  Loader,
  Center,
  Paper,
} from '@mantine/core';
import { IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import { CategoryTabs } from './CategoryTabs';
import { MealSearchBar } from './MealSearchBar';
import { MealCardFlipWrapper } from './MealCardFlipWrapper';
import { notifications } from '@mantine/notifications';
import { ConfirmationModal } from '../modals/ConfirmationModal';

interface Category {
  id: number;
  name: string;
  color: string | null;
  _count?: {
    meals: number;
  };
}

interface Meal {
  id: number;
  title: string;
  imageUrl: string | null;
  rating: number;
  recipeText: string | null;
  category?: {
    id: number;
    name: string;
    color: string | null;
  } | null;
}

interface MealListPanelProps {
  onEditMeal?: (meal: Meal) => void;
  onCreateMeal?: () => void;
  onManageCategories?: () => void;
  onMealDeleted?: () => void;
}

export function MealListPanel({
  onEditMeal,
  onCreateMeal,
  onManageCategories,
  onMealDeleted,
}: MealListPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalMealCount, setTotalMealCount] = useState(0);
  const [uncategorizedMealCount, setUncategorizedMealCount] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null | -1>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setTotalMealCount(data.totalMealCount);
        setUncategorizedMealCount(data.uncategorizedMealCount);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch meals
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategoryId === -1
          ? '/api/meals?categoryId=uncategorized'
          : selectedCategoryId
            ? `/api/meals?categoryId=${selectedCategoryId}`
            : '/api/meals';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchMeals();
  }, []);

  // Refetch meals when category changes
  useEffect(() => {
    fetchMeals();
  }, [selectedCategoryId]);

  // Handle meal deletion
  const handleDeleteMeal = async (mealId: number) => {
    setMealToDelete(mealId);
    setDeleteConfirmOpened(true);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/meals/${mealToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Meal deleted successfully',
          color: 'green',
        });
        setDeleteConfirmOpened(false);
        setMealToDelete(null);
        fetchMeals();
        onMealDeleted?.();
      } else {
        throw new Error('Failed to delete meal');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete meal',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpened(false);
    setMealToDelete(null);
  };

  // Filter meals by search query
  const filteredMeals = meals.filter((meal) =>
    meal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Paper h="100%" p="md" style={{ display: 'flex', flexDirection: 'column' }}>
      <Stack gap="md" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Header with actions */}
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            Meal Catalog
          </Text>
          <Group gap="xs">
            <Button
              leftSection={<IconSettings size={18} />}
              variant="light"
              size="sm"
              onClick={onManageCategories}
            >
              Categories
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              size="sm"
              onClick={onCreateMeal}
            >
              Add Meal
            </Button>
          </Group>
        </Group>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          totalMealCount={totalMealCount}
          uncategorizedMealCount={uncategorizedMealCount}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
        />

        {/* Search Bar */}
        <MealSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {/* Meals Grid */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Center h={200}>
              <Loader />
            </Center>
          ) : filteredMeals.length === 0 ? (
            <Center h={200}>
              <Text c="dimmed">
                {searchQuery
                  ? 'No meals found matching your search'
                  : 'No meals yet. Create your first meal!'}
              </Text>
            </Center>
          ) : (
            <SimpleGrid
              cols={{ base: 2, sm: 3, md: 4 }}
              spacing="md"
              verticalSpacing="md"
            >
              {filteredMeals.map((meal) => (
                <MealCardFlipWrapper
                  key={meal.id}
                  meal={meal}
                  onEdit={onEditMeal}
                  onDelete={handleDeleteMeal}
                />
              ))}
            </SimpleGrid>
          )}
        </div>
      </Stack>

      <ConfirmationModal
        opened={deleteConfirmOpened}
        onClose={handleCancelDelete}
        onConfirm={confirmDeleteMeal}
        title="Delete Meal?"
        message="Are you sure you want to delete this meal? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="red"
        icon={<IconTrash size={32} stroke={1.5} />}
        loading={deleting}
      />
    </Paper>
  );
}
