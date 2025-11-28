'use client';

import { Card, Text, Stack, ScrollArea, Button, Group } from '@mantine/core';
import { IconEdit, IconTrash, IconX } from '@tabler/icons-react';

interface MealCardBackProps {
  title: string;
  recipeText: string | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MealCardBack({
  title,
  recipeText,
  onClose,
  onEdit,
  onDelete,
}: MealCardBackProps) {
  return (
    <Card
      shadow="md"
      padding="md"
      radius="md"
      withBorder
      style={{
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Stack style={{ height: '100%' }} gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Text fw={700} size="md" style={{ flex: 1 }} lineClamp={1}>
            {title}
          </Text>
          <Button
            variant="subtle"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            p={4}
          >
            <IconX size={18} />
          </Button>
        </Group>

        {/* Recipe */}
        <ScrollArea style={{ flex: 1 }} type="auto">
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {recipeText || 'No recipe available'}
          </Text>
        </ScrollArea>

        {/* Actions */}
        <Group gap="xs">
          {onEdit && (
            <Button
              variant="light"
              size="xs"
              leftSection={<IconEdit size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={{ flex: 1 }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ flex: 1 }}
            >
              Delete
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
