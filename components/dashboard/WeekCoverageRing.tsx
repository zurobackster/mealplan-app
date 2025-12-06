'use client';

import { Paper, Text, Stack, Center } from '@mantine/core';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface WeekCoverageRingProps {
  filled: number;
  total: number;
}

export function WeekCoverageRing({ filled, total }: WeekCoverageRingProps) {
  const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;

  // Calculate the end angle based on percentage (clockwise from top)
  // StartAngle: 90 (top), EndAngle: 90 - (percentage * 3.6) degrees
  const startAngle = 90;
  const endAngle = 90 - (percentage * 3.6); // 3.6 degrees per percent

  const data = [
    {
      name: 'Coverage',
      value: 100, // Use full value for the bar
      fill: '#4CAF50',
    },
  ];

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
          Current Week Coverage
        </Text>

        <div style={{ position: 'relative', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              barSize={20}
              data={data}
              startAngle={startAngle}
              endAngle={endAngle}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center text */}
          <Center
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: 'column',
            }}
          >
            <Text size="xl" fw={700} style={{ fontSize: '2.5rem', lineHeight: 1 }}>
              {percentage}%
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              {filled}/{total} days
            </Text>
          </Center>
        </div>
      </Stack>
    </Paper>
  );
}
