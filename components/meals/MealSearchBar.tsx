'use client';

import { TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect } from 'react';

interface MealSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
}

export function MealSearchBar({
  value,
  onChange,
  onDebouncedChange,
}: MealSearchBarProps) {
  const [debouncedValue] = useDebouncedValue(value, 300);

  useEffect(() => {
    if (onDebouncedChange) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange]);

  return (
    <TextInput
      placeholder="Search meals..."
      leftSection={<IconSearch size={18} />}
      rightSection={
        value ? (
          <IconX
            size={18}
            style={{ cursor: 'pointer' }}
            onClick={() => onChange('')}
          />
        ) : null
      }
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      size="md"
    />
  );
}
