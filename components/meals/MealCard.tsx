'use client';

import { Card, Image, Text, Badge, Group, Stack, Rating } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

interface MealCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  rating: number;
  categoryName?: string;
  categoryColor?: string;
  onClick?: () => void;
}

export function MealCard({
  id,
  title,
  imageUrl,
  rating,
  categoryName,
  categoryColor,
  onClick,
}: MealCardProps) {
  return (
    <Card
      shadow="sm"
      padding="0"
      radius="md"
      withBorder
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClick}
      sx={{
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Image - 70% */}
      <div style={{ flex: '0 0 70%', position: 'relative', overflow: 'hidden' }}>
        <Image
          src={imageUrl || '/uploads/placeholder.jpg'}
          alt={title}
          height="100%"
          fit="cover"
          fallbackSrc="https://placehold.co/400x400/e0e0e0/666666?text=No+Image"
        />
        {categoryName && (
          <Badge
            color={categoryColor || 'gray'}
            variant="filled"
            size="sm"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            {categoryName}
          </Badge>
        )}
      </div>

      {/* Title + Rating - 30% */}
      <Stack
        gap="xs"
        p="sm"
        style={{
          flex: '0 0 30%',
          justifyContent: 'center',
        }}
      >
        <Text
          fw={600}
          size="sm"
          lineClamp={2}
          style={{ lineHeight: 1.3 }}
        >
          {title}
        </Text>
        <Group gap="xs">
          <Rating value={rating} readOnly size="xs" />
          <Text size="xs" c="dimmed">
            ({rating})
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
