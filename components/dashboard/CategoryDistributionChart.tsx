'use client';

import { useState, useEffect } from 'react';
import { Paper, Text, Stack } from '@mantine/core';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  categoryName: string;
  count: number;
  categoryColor: string | null;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (data.length === 0) {
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
          <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Category Distribution
          </Text>
          <Text c="dimmed" ta="center" py="xl">
            No meals categorized yet
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Prepare data for chart
  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.count,
    color: item.categoryColor || '#999',
  }));

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
        <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Category Distribution
        </Text>

        <div style={{ height: 250, minHeight: 250 }}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Stack>
    </Paper>
  );
}
