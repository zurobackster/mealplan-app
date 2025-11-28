'use client';

import { Group, Button, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { getMonday, formatWeekRange } from '@/lib/utils/date';

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
          onChange={(date) => date && onDateChange(date)}
          leftSection={<IconCalendar size={18} />}
          size="sm"
          style={{ width: 200 }}
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
