'use client';

import { Tabs, Badge, Group } from '@mantine/core';

interface Category {
  id: number;
  name: string;
  color: string | null;
  _count?: {
    meals: number;
  };
}

interface CategoryTabsProps {
  categories: Category[];
  totalMealCount: number;
  uncategorizedMealCount: number;
  selectedCategoryId: number | null | -1;
  onCategoryChange: (categoryId: number | null | -1) => void;
}

export function CategoryTabs({
  categories,
  totalMealCount,
  uncategorizedMealCount,
  selectedCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  const tabValue =
    selectedCategoryId === -1
      ? 'uncategorized'
      : selectedCategoryId?.toString() || 'all';

  return (
    <Tabs
      value={tabValue}
      onChange={(value) => {
        if (value === 'all') {
          onCategoryChange(null);
        } else if (value === 'uncategorized') {
          onCategoryChange(-1);
        } else {
          onCategoryChange(parseInt(value || '0'));
        }
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="all">
          <Group gap="xs">
            All Meals
            <Badge size="sm" variant="light" color="gray">
              {totalMealCount}
            </Badge>
          </Group>
        </Tabs.Tab>
        <Tabs.Tab value="uncategorized" color="cyan">
          <Group gap="xs">
            Others
            <Badge size="sm" variant="light" color="cyan">
              {uncategorizedMealCount}
            </Badge>
          </Group>
        </Tabs.Tab>
        {categories.map((category) => (
          <Tabs.Tab
            key={category.id}
            value={category.id.toString()}
            color={category.color || undefined}
          >
            <Group gap="xs">
              {category.name}
              <Badge
                size="sm"
                variant="light"
                color={category.color || 'gray'}
              >
                {category._count?.meals || 0}
              </Badge>
            </Group>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
