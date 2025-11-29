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
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { CategoryTabs } from './CategoryTabs';
import { MealSearchBar } from './MealSearchBar';
import { MealCardFlipWrapper } from './MealCardFlipWrapper';
import { notifications } from '@mantine/notifications';

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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch meals
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const url = selectedCategoryId
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
    if (!confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Meal deleted successfully',
          color: 'green',
        });
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
    }
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
    </Paper>
  );
}
