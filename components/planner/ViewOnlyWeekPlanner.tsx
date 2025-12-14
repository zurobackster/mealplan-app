'use client';

import { useRef, useState } from 'react';
import { Stack, Loader, Center, Text, Flex } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { toPng } from 'html-to-image';
import { WeekSelector } from './WeekSelector';
import { ViewOnlyDayColumn } from './ViewOnlyDayColumn';
import { getMonday } from '@/lib/utils/date';

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

interface ViewOnlyWeekPlannerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  weeklyPlan: WeeklyPlan | null;
  loading: boolean;
}

export function ViewOnlyWeekPlanner({
  selectedDate,
  onDateChange,
  weeklyPlan,
  loading,
}: ViewOnlyWeekPlannerProps) {
  const weeklyPlanRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPlan = async () => {
    try {
      setExporting(true);
      const element = weeklyPlanRef.current;

      if (!element) {
        throw new Error('Weekly plan element not found');
      }

      // Store original styles to restore later
      const originalStyles = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        position: element.style.position,
      };

      // Force the Flex container to render at full width
      element.style.width = 'max-content';
      element.style.minWidth = 'max-content';
      element.style.position = 'relative';

      // Wait for layout to settle
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8f9fa',
        width: element.scrollWidth, // Explicitly set width to full scrollable width
        height: element.scrollHeight,
      });

      // Restore original styles
      element.style.width = originalStyles.width || '';
      element.style.minWidth = originalStyles.minWidth || '';
      element.style.position = originalStyles.position || '';

      // Download as PNG
      const link = document.createElement('a');
      const monday = getMonday(selectedDate);
      const weekStartDate = monday.toISOString().split('T')[0];
      link.download = `meal-plan-${weekStartDate}.png`;
      link.href = dataUrl;
      link.click();

      notifications.show({
        title: 'Success',
        message: 'Weekly plan exported as image',
        color: 'green',
      });
    } catch (error) {
      console.error('Export error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to export weekly plan',
        color: 'red',
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!weeklyPlan) {
    return (
      <Center h={400}>
        <Text c="dimmed">Failed to load weekly plan</Text>
      </Center>
    );
  }

  const monday = getMonday(selectedDate);

  return (
    <Stack gap="md" style={{ height: '100%', overflow: 'hidden' }}>
      <WeekSelector
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onExportPlan={handleExportPlan}
        exporting={exporting}
      />

      {/* Horizontal scroll with native CSS overflow */}
      <div
        className="horizontal-scroll-container"
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Flex
          ref={weeklyPlanRef}
          direction="row"
          wrap="nowrap"
          gap="md"
          style={{ height: '100%', minWidth: 'min-content' }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
            <ViewOnlyDayColumn
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              monday={monday}
              meals={weeklyPlan.plannedMeals.filter((m) => m.dayOfWeek === dayOfWeek)}
            />
          ))}
        </Flex>
      </div>
    </Stack>
  );
}
