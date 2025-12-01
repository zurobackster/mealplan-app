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
      padding="0"
      withBorder
      style={{
        cursor: 'grab',
        transition: 'transform 0.2s, box-shadow 0.2s',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      sx={{
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Image - 70% */}
      <div style={{ flex: '0 0 70%', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
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
          fw={700}
          size="sm"
          lineClamp={2}
          style={{ lineHeight: 1.3 }}
        >
          {title}
        </Text>
        <Group gap="xs">
          <Rating
            value={rating}
            readOnly
            size="sm"
            color="yellow"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(251, 192, 45, 0.3))'
            }}
          />
          <Text size="xs" c="dimmed">
            ({rating})
          </Text>
        </Group>
      </Stack>
    </Card>
    </div>
  );
}
