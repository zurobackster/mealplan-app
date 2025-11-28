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
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategoryTabs({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <Tabs
      value={selectedCategoryId?.toString() || 'all'}
      onChange={(value) => {
        onCategoryChange(value === 'all' ? null : parseInt(value || '0'));
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="all">
          <Group gap="xs">
            All Meals
            <Badge size="sm" variant="light" color="gray">
              {categories.reduce((sum, cat) => sum + (cat._count?.meals || 0), 0)}
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
