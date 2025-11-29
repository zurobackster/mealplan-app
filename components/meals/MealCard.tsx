'use client';

import { Card, Image, Text, Badge, Group, Stack, Rating } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({
        type: 'catalog-meal',
        id,
        title,
        imageUrl,
        rating,
        categoryName,
        categoryColor,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [id, title, imageUrl, rating, categoryName, categoryColor]);

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={cardRef} style={style} onClick={onClick}>
      <Card
      shadow="sm"
      padding="0"
      radius="md"
      withBorder
      style={{
        cursor: 'grab',
        transition: 'transform 0.2s, box-shadow 0.2s',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
      }}
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
          draggable={false}
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
    </div>
  );
}
