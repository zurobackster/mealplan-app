'use client';

import { Text, Badge, Group } from '@mantine/core';

interface CalendarDayCellProps {
  date: Date;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  dayNumber: number;
  isToday: boolean;
  mealData?: {
    mealCount: number;
    hasBreakfast: boolean;
    hasLunch: boolean;
    hasDinner: boolean;
    hasOther: boolean;
  };
  onClick: (dateString: string) => void;
}

export function CalendarDayCell({
  dateString,
  isCurrentMonth,
  dayNumber,
  isToday,
  mealData,
  onClick,
}: CalendarDayCellProps) {
  const hasMeals = mealData && mealData.mealCount > 0;

  return (
    <div
      onClick={() => hasMeals && onClick(dateString)}
      style={{
        minHeight: 80,
        padding: '8px',
        borderRadius: '8px',
        border: isToday ? '3px solid #2196F3' : '1px solid #e9ecef',
        backgroundColor: isToday
          ? 'rgba(33, 150, 243, 0.08)'
          : (isCurrentMonth ? 'white' : '#f8f9fa'),
        boxShadow: isToday ? '0 0 0 3px rgba(33, 150, 243, 0.2)' : undefined,
        cursor: hasMeals ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        opacity: isCurrentMonth ? 1 : 0.5,
      }}
      onMouseEnter={(e) => {
        if (hasMeals) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hasMeals) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Day number */}
        <Text
          size="sm"
          fw={isToday ? 700 : 500}
          c={isToday ? 'blue' : (isCurrentMonth ? 'dark' : 'dimmed')}
        >
          {dayNumber}
        </Text>

        {/* Meal indicators */}
        {hasMeals && mealData && (
          <div style={{ marginTop: 'auto' }}>
            <Group gap={4} justify="center">
              {mealData.hasBreakfast && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50', // Green for breakfast
                  }}
                  title="Breakfast"
                />
              )}
              {mealData.hasLunch && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#FFC107', // Yellow for lunch
                  }}
                  title="Lunch"
                />
              )}
              {mealData.hasDinner && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#FF9800', // Orange for dinner
                  }}
                  title="Dinner"
                />
              )}
              {mealData.hasOther && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#2196F3', // Blue for other
                  }}
                  title="Other"
                />
              )}
            </Group>
            <Badge
              size="xs"
              color="green"
              variant="light"
              mt={4}
              style={{ display: 'block', textAlign: 'center' }}
            >
              {mealData.mealCount} meal{mealData.mealCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
