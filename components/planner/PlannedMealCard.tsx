'use client';

import { Card, Image, Text, Group, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlannedMealCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  categoryColor?: string | null;
  onRemove: () => void;
}

export function PlannedMealCard({
  id,
  title,
  imageUrl,
  categoryColor,
  onRemove,
}: PlannedMealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
      <Group gap="xs" wrap="nowrap">
        <Image
          src={imageUrl || '/uploads/placeholder.jpg'}
          alt={title}
          width={40}
          height={40}
          radius="sm"
          fit="cover"
          fallbackSrc="https://placehold.co/40x40/e0e0e0/666666?text=M"
          style={{ flexShrink: 0 }}
        />
        <Text size="sm" fw={500} style={{ flex: 1 }} lineClamp={2}>
          {title}
        </Text>
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
