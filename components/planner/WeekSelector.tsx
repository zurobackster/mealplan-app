'use client';

import { useState } from 'react';
import { Group, Button, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconList,
  IconDownload,
} from '@tabler/icons-react';
import { getMonday, formatWeekRange } from '@/lib/utils/date';
import dayjs from 'dayjs';
import { IngredientsReviewModal } from '@/components/modals/IngredientsReviewModal';

interface WeekSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onExportPlan?: () => void;
  exporting?: boolean;
}

export function WeekSelector({
  selectedDate,
  onDateChange,
  onExportPlan,
  exporting = false,
}: WeekSelectorProps) {
  const [modalOpened, setModalOpened] = useState(false);
  const monday = getMonday(selectedDate);

  const handlePrevWeek = () => {
    const prevWeek = new Date(monday);
    prevWeek.setDate(prevWeek.getDate() - 7);
    onDateChange(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(monday);
    nextWeek.setDate(nextWeek.getDate() + 7);
    onDateChange(nextWeek);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleReviewIngredients = () => {
    setModalOpened(true);
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Button
            variant="subtle"
            size="sm"
            onClick={handlePrevWeek}
            leftSection={<IconChevronLeft size={16} />}
          >
            Prev
          </Button>
          <DatePickerInput
            value={selectedDate}
            onChange={(dateStr: string | null) => {
              if (dateStr) {
                const date = new Date(dateStr);
                onDateChange(date);
              }
            }}
            leftSection={<IconCalendar size={18} />}
            size="sm"
            style={{ width: 200 }}
            getDayProps={(date) => {
              const isToday = dayjs().isSame(dayjs(date), 'day');
              return {
                style: isToday
                  ? {
                      backgroundColor: '#2196F3',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: '50%',
                    }
                  : undefined,
              };
            }}
          />
          <Button
            variant="subtle"
            size="sm"
            onClick={handleNextWeek}
            rightSection={<IconChevronRight size={16} />}
          >
            Next
          </Button>
        </Group>
        <Group gap="sm">
          <Text size="sm" fw={600}>
            {formatWeekRange(monday)}
          </Text>
          <Button variant="light" size="sm" onClick={handleToday}>
            Today
          </Button>
          {onExportPlan && (
            <Button
              variant="light"
              size="sm"
              color="blue"
              leftSection={<IconDownload size={16} />}
              onClick={onExportPlan}
              loading={exporting}
            >
              Export Plan
            </Button>
          )}
          <Button
            variant="light"
            size="sm"
            color="green"
            leftSection={<IconList size={16} />}
            onClick={handleReviewIngredients}
          >
            Review Ingredients
          </Button>
        </Group>
      </Group>

      <IngredientsReviewModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        selectedDate={selectedDate}
      />
    </>
  );
}
