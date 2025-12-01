'use client';

import { useEffect, useState } from 'react';
import { Text, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ViewOnlyWeekPlanner } from '@/components/planner/ViewOnlyWeekPlanner';
import { getMonday, formatISODate } from '@/lib/utils/date';

interface WeeklyPlan {
  id: number;
  plannedMeals: PlannedMeal[];
}

interface PlannedMeal {
  id: number;
  dayOfWeek: number;
  slot: string;
  meal: {
    id: number;
    title: string;
    rating: number;
    imageUrl: string | null;
    category?: {
      color: string | null;
    } | null;
  };
}

export default function ViewPlanPage() {
  const [loading, setLoading] = useState(true);

  // Weekly planner state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.isLoggedIn) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch weekly plan
  const fetchWeeklyPlan = async (date: Date) => {
    try {
      setPlannerLoading(true);
      const monday = getMonday(date);
      const weekStartDate = formatISODate(monday);

      const response = await fetch(`/api/weekly-plans?weekStartDate=${weekStartDate}`);
      if (response.ok) {
        const data = await response.json();
        setWeeklyPlan(data);
      }
    } catch (error) {
      console.error('Failed to fetch weekly plan:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load weekly plan',
        color: 'red',
      });
    } finally {
      setPlannerLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyPlan(selectedDate);
  }, [selectedDate]);

  if (loading) {
    return (
      <Box p="xl">
        <Text ta="center">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Weekly Planner - Full Width */}
      <Box
        style={{
          flex: 1,
          padding: '24px',
          backgroundColor: '#f8f9fa',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ViewOnlyWeekPlanner
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          weeklyPlan={weeklyPlan}
          loading={plannerLoading}
        />
      </Box>
    </Box>
  );
}
