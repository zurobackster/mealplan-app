'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, Box, Paper } from '@mantine/core';
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
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
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
          setUser(data.user);
        }
        setLoading(false);
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      notifications.show({
        title: 'Logged Out',
        message: 'You have been logged out successfully',
        color: 'blue',
      });
      router.push('/login');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to log out',
        color: 'red',
      });
    }
  };

  const handleBackToPlanner = () => {
    router.push('/planner');
  };

  if (loading) {
    return (
      <Box p="xl">
        <Text ta="center">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper p="md" shadow="sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text size="xl" fw={700}>
              View Meal Plan
            </Text>
            {user && (
              <Text c="dimmed" size="sm">
                Welcome, {user.username}
              </Text>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleBackToPlanner} variant="filled" color="violet">
              Back to Planner
            </Button>
            <Button onClick={handleLogout} variant="outline" color="red" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </Paper>

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
