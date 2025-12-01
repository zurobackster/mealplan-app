'use client';

import { Card, Image, Text, Group, Rating } from '@mantine/core';

interface ViewOnlyMealCardProps {
  title: string;
  imageUrl: string | null;
  rating: number;
  categoryColor?: string | null;
}

export function ViewOnlyMealCard({
  title,
  imageUrl,
  rating,
  categoryColor,
}: ViewOnlyMealCardProps) {
  return (
    <Card
      padding="xs"
      withBorder
      style={{
        borderLeft: categoryColor ? `4px solid ${categoryColor}` : undefined,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <div style={{ width: 40, height: 40, flexShrink: 0 }}>
          <Image
            src={imageUrl || '/uploads/placeholder.jpg'}
            alt={title}
            width={40}
            height={40}
            radius="sm"
            fit="cover"
            fallbackSrc="https://placehold.co/40x40/e0e0e0/666666?text=M"
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} lineClamp={1} mb={2} c="dark">
            {title}
          </Text>
          <Rating
            value={rating}
            size="sm"
            readOnly
            color="yellow"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(251, 192, 45, 0.3))'
            }}
          />
        </div>
      </Group>
    </Card>
  );
}
