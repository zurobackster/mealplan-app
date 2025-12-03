'use client';

import { Paper, Text, Stack } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FrequencyData {
  title: string;
  planCount: number;
}

interface FrequencyChartProps {
  data: FrequencyData[];
}

export function FrequencyChart({ data }: FrequencyChartProps) {
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
            Most Frequently Planned
          </Text>
          <Text c="dimmed" ta="center" py="xl">
            No meals planned yet
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Prepare data for chart (truncate long titles)
  const chartData = data.map((item) => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title,
    count: item.planCount,
    fullName: item.title,
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
          Most Frequently Planned
        </Text>

        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={90} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <Paper p="xs" shadow="sm" withBorder>
                        <Text size="sm" fw={600}>{payload[0].payload.fullName}</Text>
                        <Text size="xs" c="dimmed">Planned {payload[0].value} times</Text>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#4CAF50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Paper>
  );
}
