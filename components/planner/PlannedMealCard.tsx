'use client';

import { Card, Image, Text, Group, ActionIcon, Rating } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

interface PlannedMealCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  rating: number;
  categoryColor?: string | null;
  dayOfWeek: number;
  slot: string;
  onRemove: () => void;
}

export function PlannedMealCard({
  id,
  title,
  imageUrl,
  rating,
  categoryColor,
  dayOfWeek,
  slot,
  onRemove,
}: PlannedMealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    invariant(el);

    return combine(
      // Make it draggable
      draggable({
        element: el,
        getInitialData: () => ({
          type: 'planned-meal',
          id,
          dayOfWeek,
          slot,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      // Make it a drop target for reordering
      dropTargetForElements({
        element: el,
        getData: ({ input, element }) => {
          return attachClosestEdge(
            { type: 'planned-meal', id, dayOfWeek, slot },
            { input, element, allowedEdges: ['top', 'bottom'] }
          );
        },
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: () => setIsDraggedOver(false),
      })
    );
  }, [id, dayOfWeek, slot]);

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={cardRef}
      style={style}
      shadow="xs"
      padding="xs"
      radius="md"
      withBorder
      sx={{
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transform: 'translateY(-1px)',
          transition: 'all 0.2s ease',
        },
        borderLeft: categoryColor ? `4px solid ${categoryColor}` : undefined,
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
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
            draggable={false}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Text size="sm" fw={500} lineClamp={1} mb={2} c="dark">
            {title}
          </Text>
          <Rating value={rating} size="xs" readOnly />
        </div>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="red"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ flexShrink: 0 }}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Card>
  );
}
