'use client';

import { Paper, Text, Group, Stack } from '@mantine/core';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  color = '#4CAF50',
  subtitle,
}: MetricCardProps) {
  return (
    <Paper
      p="lg"
      radius={12}
      withBorder
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        height: '100%',
      }}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </Text>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </div>
        </Group>
        <div>
          <Text size="xxl" fw={700} style={{ lineHeight: 1 }}>
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </div>
      </Stack>
    </Paper>
  );
}
