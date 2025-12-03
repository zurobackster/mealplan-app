'use client';

import { Paper, Text, Group, ActionIcon, SimpleGrid, Stack } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { CalendarDayCell } from './CalendarDayCell';
import { generateCalendarGrid, formatMonthName } from '@/lib/utils/calendar';
import { useMemo } from 'react';

interface DayWithMeals {
  date: string; // YYYY-MM-DD
  mealCount: number;
  hasBreakfast: boolean;
  hasLunch: boolean;
  hasDinner: boolean;
  hasOther: boolean;
}

interface MonthCalendarProps {
  year: number;
  month: number; // 1-12
  onMonthChange: (year: number, month: number) => void;
  daysWithMeals: DayWithMeals[];
  onDayClick: (dateString: string) => void;
  loading?: boolean;
}

export function MonthCalendar({
  year,
  month,
  onMonthChange,
  daysWithMeals,
  onDayClick,
  loading = false,
}: MonthCalendarProps) {
  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(year, month);
  }, [year, month]);

  // Create a map for quick lookup of meal data
  const mealDataMap = useMemo(() => {
    const map = new Map<string, DayWithMeals>();
    daysWithMeals.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [daysWithMeals]);

  // Handle month navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Paper
      p="lg"
      radius={12}
      withBorder
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Stack gap="md">
        {/* Header with navigation */}
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            {formatMonthName(month)} {year}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={handlePrevMonth}
              disabled={loading}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={handleNextMonth}
              disabled={loading}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Week day headers */}
        <SimpleGrid cols={7} spacing="xs">
          {weekDays.map((day) => (
            <Text
              key={day}
              size="xs"
              fw={600}
              c="dimmed"
              ta="center"
              style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              {day}
            </Text>
          ))}
        </SimpleGrid>

        {/* Calendar grid */}
        <SimpleGrid cols={7} spacing="xs">
          {calendarGrid.map((day) => {
            const mealData = mealDataMap.get(day.dateString);
            return (
              <CalendarDayCell
                key={day.dateString}
                date={day.date}
                dateString={day.dateString}
                isCurrentMonth={day.isCurrentMonth}
                dayNumber={day.dayNumber}
                isToday={day.isToday}
                mealData={mealData}
                onClick={onDayClick}
              />
            );
          })}
        </SimpleGrid>

        {/* Legend */}
        <Group gap="md" justify="center" mt="sm">
          <Group gap={4}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
            <Text size="xs" c="dimmed">Breakfast</Text>
          </Group>
          <Group gap={4}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FFC107' }} />
            <Text size="xs" c="dimmed">Lunch</Text>
          </Group>
          <Group gap={4}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF9800' }} />
            <Text size="xs" c="dimmed">Dinner</Text>
          </Group>
          <Group gap={4}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2196F3' }} />
            <Text size="xs" c="dimmed">Other</Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
