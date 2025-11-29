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
      shadow="xs"
      padding="xs"
      radius="md"
      withBorder
      sx={{
        borderLeft: categoryColor ? `4px solid ${categoryColor}` : undefined,
        backgroundColor: 'white',
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
          <Rating value={rating} size="xs" readOnly />
        </div>
      </Group>
    </Card>
  );
}
