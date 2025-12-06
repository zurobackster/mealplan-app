'use client';

import { useState, useEffect } from 'react';
import { Stack, Skeleton, Paper, SimpleGrid } from '@mantine/core';
import { WeekSelector } from '@/components/planner/WeekSelector';
import { WeekCoverageRing } from './WeekCoverageRing';
import { DayStatusTable } from './DayStatusTable';
import { getMonday, formatISODate } from '@/lib/utils/date';

interface CoverageData {
  totalSlots: number;
  filledSlots: number;
  coveragePercentage: number;
  daysWithMeals: number[];
}

export function WeekCoverageRingWrapper() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monday = getMonday(selectedDate);
    const weekStartDate = formatISODate(monday);

    setLoading(true);
    fetch(`/api/dashboard/metrics?weekStartDate=${weekStartDate}`)
      .then((res) => res.json())
      .then((data) => {
        setCoverage(data.currentWeekCoverage);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching coverage:', error);
        setLoading(false);
      });
  }, [selectedDate]);

  return (
    <Stack gap="md">
      {/* Week Selector - Full Width */}
      <Paper
        p="md"
        radius={12}
        withBorder
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          minHeight: 60,
          width: '100%'
        }}
      >
        <WeekSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </Paper>

      {/* Coverage Cards - 50/50 Split */}
      {loading ? (
        <Skeleton height={250} radius={12} />
      ) : coverage ? (
        <SimpleGrid cols={2} spacing="md">
          {/* Left Card: Coverage Ring */}
          <WeekCoverageRing filled={coverage.filledSlots} total={coverage.totalSlots} />

          {/* Right Card: Day Status Table */}
          <DayStatusTable
            selectedDate={selectedDate}
            daysWithMeals={coverage.daysWithMeals}
          />
        </SimpleGrid>
      ) : null}
    </Stack>
  );
}
