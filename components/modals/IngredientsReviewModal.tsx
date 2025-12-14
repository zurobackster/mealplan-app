'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Text,
  Group,
  Center,
  Stack,
  Loader,
  ScrollArea,
  Rating,
  List,
  Button,
} from '@mantine/core';
import {
  IconList,
  IconAlertCircle,
  IconCopy,
  IconBrandWhatsapp,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getMonday, formatISODate } from '@/lib/utils/date';
import {
  generateIngredientsText,
  type WeeklyIngredientsData as WeeklyIngredientsFormatterData,
} from '@/lib/utils/ingredientsFormatter';

interface PlannedDay {
  dayOfWeek: number;
  date: string;
  slots: string[];
}

interface MealData {
  mealId: number;
  title: string;
  rating: number;
  recipeText: string | null;
  imageUrl: string | null;
  plannedDays: PlannedDay[];
  earliestDay: number;
}

interface WeeklyIngredientsData {
  weekStartDate: string;
  meals: MealData[];
}

interface IngredientsReviewModalProps {
  opened: boolean;
  onClose: () => void;
  selectedDate: Date;
}

// Helper function to format slots text
function formatSlots(slots: string[]): string {
  return slots
    .map((slot) => slot.charAt(0) + slot.slice(1).toLowerCase())
    .join(', ');
}

export function IngredientsReviewModal({
  opened,
  onClose,
  selectedDate,
}: IngredientsReviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklyIngredientsData | null>(null);

  useEffect(() => {
    if (!opened) return;

    const fetchWeeklyIngredients = async () => {
      try {
        setLoading(true);
        const monday = getMonday(selectedDate);
        const weekStartDate = formatISODate(monday);

        const response = await fetch(`/api/weekly-plans/ingredients?weekStartDate=${weekStartDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weekly ingredients');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching weekly ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyIngredients();
  }, [opened, selectedDate]);

  // Check if week is empty
  const isWeekEmpty = data?.meals.length === 0;

  const handleCopyToClipboard = async () => {
    if (!data) return;

    try {
      const text = generateIngredientsText(data as WeeklyIngredientsFormatterData);
      await navigator.clipboard.writeText(text);

      notifications.show({
        title: 'Copied!',
        message: 'Ingredients copied to clipboard',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      // Fallback for older browsers or HTTP contexts
      const textArea = document.createElement('textarea');
      const text = generateIngredientsText(data as WeeklyIngredientsFormatterData);
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        notifications.show({
          title: 'Copied!',
          message: 'Ingredients copied to clipboard',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } catch (err) {
        notifications.show({
          title: 'Error',
          message: 'Failed to copy to clipboard',
          color: 'red',
        });
      }

      document.body.removeChild(textArea);
    }
  };

  const handleShareToWhatsApp = () => {
    if (!data) return;

    const text = generateIngredientsText(data as WeeklyIngredientsFormatterData);
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    notifications.show({
      title: 'Opening WhatsApp',
      message: 'Share your meal plan ingredients',
      color: 'green',
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconList size={20} color="var(--mantine-color-green-6)" />
          <Text fw={600}>Weekly Ingredients Review</Text>
        </Group>
      }
      size="xl"
      centered
      styles={{
        header: {
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
        },
        body: {
          padding: 0,
        },
      }}
    >
      {loading ? (
        <Center py="xl">
          <Loader color="green" size="lg" />
        </Center>
      ) : isWeekEmpty ? (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <IconAlertCircle size={48} color="gray" />
            <Text c="dimmed" fw={600}>No meals planned for this week</Text>
            <Text size="sm" c="dimmed" ta="center">
              Add meals to your weekly plan to see ingredients here
            </Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea style={{ height: '600px' }}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '250px' }}>Meal</Table.Th>
                <Table.Th style={{ width: '350px' }}>Days Planned</Table.Th>
                <Table.Th>Recipe / Ingredients</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.meals.map((meal) => (
                <Table.Tr key={meal.mealId}>
                  <Table.Td style={{ verticalAlign: 'top' }}>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        {meal.title}
                      </Text>
                      <Rating value={meal.rating} readOnly size="xs" color="yellow" />
                    </Stack>
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: 'top' }}>
                    <List size="sm" spacing={4}>
                      {meal.plannedDays.map((day, index) => (
                        <List.Item key={`${meal.mealId}-${day.dayOfWeek}-${index}`}>
                          {day.date} ({formatSlots(day.slots)})
                        </List.Item>
                      ))}
                    </List>
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: 'top' }}>
                    <ScrollArea h={100}>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {meal.recipeText || (
                          <Text component="span" c="dimmed" size="sm">No recipe available</Text>
                        )}
                      </Text>
                    </ScrollArea>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      {!loading && !isWeekEmpty && (
        <Group
          justify="flex-end"
          p="md"
          style={{
            borderTop: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Button
            variant="light"
            color="blue"
            leftSection={<IconCopy size={16} />}
            onClick={handleCopyToClipboard}
          >
            Copy to Clipboard
          </Button>
          <Button
            variant="light"
            color="green"
            leftSection={<IconBrandWhatsapp size={16} />}
            onClick={handleShareToWhatsApp}
          >
            Share to WhatsApp
          </Button>
        </Group>
      )}
    </Modal>
  );
}
