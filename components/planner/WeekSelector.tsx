'use client';

import { Group, Button, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { getMonday, formatWeekRange } from '@/lib/utils/date';
import dayjs from 'dayjs';

interface WeekSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeekSelector({ selectedDate, onDateChange }: WeekSelectorProps) {
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

  return (
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
      </Group>
    </Group>
  );
}
