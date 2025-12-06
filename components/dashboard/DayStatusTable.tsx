'use client';

import { Paper, Text, Stack, Table, Badge } from '@mantine/core';
import dayjs from 'dayjs';

interface DayStatusTableProps {
  selectedDate: Date;
  daysWithMeals: number[]; // Array of dayOfWeek numbers (1-7)
}

export function DayStatusTable({ selectedDate, daysWithMeals }: DayStatusTableProps) {
  // Get Monday of selected week
  const monday = dayjs(selectedDate).isoWeekday(1);

  // Generate all 7 days with status
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayOfWeek = i + 1; // 1-7
    const date = monday.add(i, 'days');
    const hasMeal = daysWithMeals.includes(dayOfWeek);

    return {
      dayOfWeek,
      label: date.format('ddd, MMM D'),
      hasMeal,
    };
  });

  return (
    <Paper
      p="lg"
      radius={12}
      withBorder
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        height: '100%',
      }}
    >
      <Stack gap="md">
        <Text
          size="sm"
          fw={600}
          c="dimmed"
          style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Daily Meal Status
        </Text>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Day</Table.Th>
              <Table.Th>Meal</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {weekDays.map((day) => (
              <Table.Tr key={day.dayOfWeek}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {day.label}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={day.hasMeal ? 'green' : 'gray'}
                    variant={day.hasMeal ? 'light' : 'outline'}
                    size="sm"
                  >
                    {day.hasMeal ? 'Meal planned' : 'Missing Meals'}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
