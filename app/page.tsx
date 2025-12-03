'use client';

import { useState, useEffect } from 'react';
import { Box, Text, SimpleGrid, Stack, Loader, Center, Paper } from '@mantine/core';
import { IconChefHat, IconStar, IconChartBar, IconBook } from '@tabler/icons-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TopMealsGrid } from '@/components/dashboard/TopMealsGrid';
import { WeekCoverageRing } from '@/components/dashboard/WeekCoverageRing';
import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart';
import { FrequencyChart } from '@/components/dashboard/FrequencyChart';
import { MonthCalendar } from '@/components/dashboard/MonthCalendar';
import { DayDetailModal } from '@/components/dashboard/DayDetailModal';

interface DashboardMetrics {
  totalMeals: number;
  totalCategories: number;
  mealsByCategory: Array<{
    categoryId: number | null;
    categoryName: string;
    categoryColor: string | null;
    count: number;
  }>;
  topRatedMeals: Array<{
    id: number;
    title: string;
    rating: number;
    imageUrl: string | null;
    category: { name: string; color: string | null; } | null;
  }>;
  favoriteMeals: number;
  averageRating: number;
  mealsWithRecipes: number;
  mealsWithoutRecipes: number;
  recipeCompletionRate: number;
  currentWeekCoverage: {
    totalSlots: number;
    filledSlots: number;
    coveragePercentage: number;
  };
  mostFrequentlyPlannedMeals: Array<{
    mealId: number;
    title: string;
    imageUrl: string | null;
    planCount: number;
    category: { name: string; color: string | null; } | null;
  }>;
}

interface CalendarData {
  year: number;
  month: number;
  daysWithMeals: Array<{
    date: string;
    mealCount: number;
    hasBreakfast: boolean;
    hasLunch: boolean;
    hasDinner: boolean;
    hasOther: boolean;
  }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12

  // Modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  // Fetch dashboard metrics
  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      });
  }, []);

  // Fetch calendar data when month changes
  useEffect(() => {
    setCalendarLoading(true);
    fetch(`/api/dashboard/calendar?year=${currentYear}&month=${currentMonth}`)
      .then((res) => res.json())
      .then((data) => {
        setCalendarData(data);
        setCalendarLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching calendar:', error);
        setCalendarLoading(false);
      });
  }, [currentYear, currentMonth]);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleDayClick = (dateString: string) => {
    setSelectedDate(dateString);
    setModalOpened(true);
  };

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  if (!metrics) {
    return (
      <Center style={{ height: '100vh' }}>
        <Text c="red">Failed to load dashboard data</Text>
      </Center>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }} p={24}>
      <Stack gap={24}>
        {/* Header */}
        <div>
          <Text size="xxl" fw={700} mb={4}>
            Dashboard
          </Text>
          <Text size="sm" c="dimmed">
            Your meal planning insights at a glance
          </Text>
        </div>

        {/* Metric Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <MetricCard
            title="Total Meals"
            value={metrics.totalMeals}
            icon={<IconChefHat size={24} />}
            color="#4CAF50"
            subtitle={`${metrics.totalCategories} categories`}
          />
          <MetricCard
            title="Favorites"
            value={metrics.favoriteMeals}
            icon={<IconStar size={24} />}
            color="#FFC107"
            subtitle="4-5 star meals"
          />
          <MetricCard
            title="Avg Rating"
            value={metrics.averageRating.toFixed(1)}
            icon={<IconChartBar size={24} />}
            color="#FF9800"
            subtitle="Out of 5 stars"
          />
          <MetricCard
            title="Recipes"
            value={`${metrics.recipeCompletionRate}%`}
            icon={<IconBook size={24} />}
            color="#2196F3"
            subtitle={`${metrics.mealsWithRecipes}/${metrics.totalMeals} meals`}
          />
        </SimpleGrid>

        {/* Week Coverage */}
        <WeekCoverageRing
          filled={metrics.currentWeekCoverage.filledSlots}
          total={metrics.currentWeekCoverage.totalSlots}
        />

        {/* Charts Row */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <CategoryDistributionChart
            data={metrics.mealsByCategory.map((item) => ({
              categoryName: item.categoryName,
              count: item.count,
              categoryColor: item.categoryColor || '#999',
            }))}
          />
          <FrequencyChart
            data={metrics.mostFrequentlyPlannedMeals.map((item) => ({
              title: item.title,
              planCount: item.planCount,
            }))}
          />
        </SimpleGrid>

        {/* Top Rated Meals */}
        <Paper
          p="lg"
          radius={12}
          withBorder
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Stack gap="md">
            <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Top Rated Meals
            </Text>
            <TopMealsGrid meals={metrics.topRatedMeals} />
          </Stack>
        </Paper>

        {/* Calendar */}
        <MonthCalendar
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          daysWithMeals={calendarData?.daysWithMeals || []}
          onDayClick={handleDayClick}
          loading={calendarLoading}
        />

        {/* Day Detail Modal */}
        <DayDetailModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          date={selectedDate}
        />
      </Stack>
    </Box>
  );
}
