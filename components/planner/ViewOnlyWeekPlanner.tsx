'use client';

import { useRef, useState } from 'react';
import { Stack, Loader, Center, Text, Flex } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { toPng } from 'html-to-image';
import { WeekSelector } from './WeekSelector';
import { ViewOnlyDayColumn } from './ViewOnlyDayColumn';
import { ExportImageModal } from '@/components/modals/ExportImageModal';
import { getMonday, getShortDayName } from '@/lib/utils/date';

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
  const [exportModalOpened, setExportModalOpened] = useState(false);

  const handleExportPlan = async (selectedDays: number[]) => {
    try {
      setExporting(true);
      const element = weeklyPlanRef.current;

      if (!element) {
        throw new Error('Weekly plan element not found');
      }

      // Store references to day columns and their original display styles
      const dayColumns = Array.from(element.children) as HTMLElement[];
      const originalStyles = dayColumns.map((col) => col.style.display);

      // Hide non-selected day columns
      dayColumns.forEach((column, index) => {
        const dayOfWeek = index + 1;
        if (!selectedDays.includes(dayOfWeek)) {
          column.style.display = 'none';
        }
      });

      // Store original container styles
      const originalContainerStyles = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        position: element.style.position,
      };

      // Force the Flex container to render at full width
      element.style.width = 'max-content';
      element.style.minWidth = 'max-content';
      element.style.position = 'relative';

      // Wait for layout to settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture image
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8f9fa',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Restore original styles
      element.style.width = originalContainerStyles.width || '';
      element.style.minWidth = originalContainerStyles.minWidth || '';
      element.style.position = originalContainerStyles.position || '';

      // Restore day columns display
      dayColumns.forEach((column, index) => {
        column.style.display = originalStyles[index] || '';
      });

      // Download with smart filename
      const monday = getMonday(selectedDate);
      const weekStartDate = monday.toISOString().split('T')[0];
      const dayNames = selectedDays.map((d) => getShortDayName(d)).join('-');
      const filename =
        selectedDays.length === 7
          ? `meal-plan-${weekStartDate}.png`
          : `meal-plan-${weekStartDate}-${dayNames}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      notifications.show({
        title: 'Success',
        message: 'Meal plan image exported successfully',
        color: 'green',
      });

      setExportModalOpened(false);
    } catch (error) {
      console.error('Export error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to export meal plan image',
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
        onExportPlan={() => setExportModalOpened(true)}
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

      <ExportImageModal
        opened={exportModalOpened}
        onClose={() => setExportModalOpened(false)}
        onExport={handleExportPlan}
        loading={exporting}
        weekMonday={monday}
      />
    </Stack>
  );
}
