'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Rating,
  Image,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhoto } from '@tabler/icons-react';

interface Category {
  id: number;
  name: string;
  color: string | null;
}

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

interface MealEditorModalProps {
  opened: boolean;
  onClose: () => void;
  meal?: Meal | null;
  onMealSaved: () => void;
  onOpenImageCropper: (callback: (imageUrl: string) => void) => void;
}

export function MealEditorModal({
  opened,
  onClose,
  meal,
  onMealSaved,
  onOpenImageCropper,
}: MealEditorModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recipeText, setRecipeText] = useState('');
  const [loading, setLoading] = useState(false);

  // Track images for cleanup on cancel
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [newlyUploadedImageUrl, setNewlyUploadedImageUrl] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    if (opened) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch((error) => console.error('Failed to fetch categories:', error));
    }
  }, [opened]);

  // Load meal data when editing
  useEffect(() => {
    if (opened && meal) {
      setTitle(meal.title);
      setCategoryId(meal.category?.id.toString() || null);
      setRating(meal.rating);
      setImageUrl(meal.imageUrl);
      setRecipeText(meal.recipeText || '');
      setOriginalImageUrl(meal.imageUrl);
      setNewlyUploadedImageUrl(null);
    } else if (opened) {
      // Reset form for new meal
      setTitle('');
      setCategoryId(null);
      setRating(0);
      setImageUrl(null);
      setRecipeText('');
      setOriginalImageUrl(null);
      setNewlyUploadedImageUrl(null);
    }
  }, [opened, meal]);

  const handleSave = async () => {
    if (!title.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Title is required',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      const url = meal ? `/api/meals/${meal.id}` : '/api/meals';
      const method = meal ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          categoryId: categoryId ? parseInt(categoryId) : null,
          rating,
          imageUrl,
          recipeText,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: meal ? 'Meal updated' : 'Meal created',
          color: 'green',
        });
        onMealSaved();
        onClose();
      } else {
        throw new Error('Failed to save meal');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save meal',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    onOpenImageCropper((newImageUrl) => {
      setImageUrl(newImageUrl);
      setNewlyUploadedImageUrl(newImageUrl);
    });
  };

  const handleCancel = async () => {
    // Cleanup newly uploaded image if user didn't save
    if (newlyUploadedImageUrl && newlyUploadedImageUrl !== originalImageUrl) {
      try {
        await fetch(`/api/upload?path=${encodeURIComponent(newlyUploadedImageUrl)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to cleanup image:', error);
      }
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={meal ? 'Edit Meal' : 'Create New Meal'}
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Meal title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Select
          label="Category"
          placeholder="Select category"
          value={categoryId}
          onChange={setCategoryId}
          data={categories.map((cat) => ({
            value: cat.id.toString(),
            label: cat.name,
          }))}
          clearable
        />

        <div>
          <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>
            Rating
          </label>
          <Rating value={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, display: 'block' }}>
            Image
          </label>
          <Button
            variant="light"
            leftSection={<IconPhoto size={18} />}
            onClick={handleImageClick}
            fullWidth
          >
            {imageUrl ? 'Change Image' : 'Upload Image'}
          </Button>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Meal preview"
              mt="sm"
              radius="md"
              h={200}
              fit="cover"
            />
          )}
        </div>

        <Textarea
          label="Recipe"
          placeholder="Enter recipe instructions..."
          value={recipeText}
          onChange={(e) => setRecipeText(e.currentTarget.value)}
          minRows={4}
          autosize
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            {meal ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
