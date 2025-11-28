'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  ColorInput,
  Button,
  Group,
  Paper,
  Text,
  ActionIcon,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface Category {
  id: number;
  name: string;
  color: string | null;
}

interface CategoryManagerModalProps {
  opened: boolean;
  onClose: () => void;
  onCategoriesUpdated: () => void;
}

export function CategoryManagerModal({
  opened,
  onClose,
  onCategoriesUpdated,
}: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#9c27b0');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

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

  useEffect(() => {
    if (opened) {
      fetchCategories();
    }
  }, [opened]);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, color: newCategoryColor }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Category created',
          color: 'green',
        });
        setNewCategoryName('');
        setNewCategoryColor('#9c27b0');
        fetchCategories();
        onCategoriesUpdated();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create category',
        color: 'red',
      });
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, color: editColor }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Category updated',
          color: 'green',
        });
        setEditingId(null);
        fetchCategories();
        onCategoriesUpdated();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update category',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Meals will become uncategorized.')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Category deleted',
          color: 'green',
        });
        fetchCategories();
        onCategoriesUpdated();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete category',
        color: 'red',
      });
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color || '#9c27b0');
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Manage Categories" size="md">
      <Stack gap="md">
        {/* Create new category */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Create New Category
            </Text>
            <Group>
              <TextInput
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <ColorInput
                value={newCategoryColor}
                onChange={setNewCategoryColor}
                w={100}
              />
              <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
                Add
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Existing categories */}
        <Stack gap="xs">
          {categories.map((category) => (
            <Paper key={category.id} p="sm" withBorder>
              {editingId === category.id ? (
                <Group>
                  <TextInput
                    value={editName}
                    onChange={(e) => setEditName(e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <ColorInput value={editColor} onChange={setEditColor} w={100} />
                  <ActionIcon
                    color="green"
                    onClick={() => handleUpdate(category.id)}
                  >
                    <IconCheck size={18} />
                  </ActionIcon>
                  <ActionIcon onClick={() => setEditingId(null)}>
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              ) : (
                <Group justify="space-between">
                  <Group gap="sm">
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: category.color || '#ccc',
                      }}
                    />
                    <Text>{category.name}</Text>
                  </Group>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => startEdit(category)}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(category.id)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              )}
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Modal>
  );
}
