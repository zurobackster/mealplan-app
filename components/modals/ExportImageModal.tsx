'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Group,
  Stack,
  Checkbox,
  Text,
  Alert,
} from '@mantine/core';
import { IconDownload, IconAlertCircle } from '@tabler/icons-react';
import { formatDayHeader } from '@/lib/utils/date';

interface ExportImageModalProps {
  opened: boolean;
  onClose: () => void;
  onExport: (selectedDays: number[]) => void | Promise<void>;
  loading?: boolean;
  weekMonday: Date;
}

export function ExportImageModal({
  opened,
  onClose,
  onExport,
  loading = false,
  weekMonday,
}: ExportImageModalProps) {
  // All days selected by default (1-7, Monday=1)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    if (checked) {
      setSelectedDays((prev) => [...prev, dayOfWeek].sort((a, b) => a - b));
    } else {
      setSelectedDays((prev) => prev.filter((d) => d !== dayOfWeek));
    }
  };

  const handleSelectAll = () => {
    setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
  };

  const handleClear = () => {
    setSelectedDays([]);
  };

  const handleExport = async () => {
    if (selectedDays.length === 0) return;
    await onExport(selectedDays);
  };

  const hasNoDaysSelected = selectedDays.length === 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconDownload size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={600}>Export Meal Plan Image</Text>
        </Group>
      }
      size="md"
      centered
      styles={{
        header: {
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
        },
      }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Select the days you want to include in the exported image
        </Text>

        {hasNoDaysSelected && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Please select at least one day to export
          </Alert>
        )}

        <Stack gap="xs">
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
            <Checkbox
              key={dayOfWeek}
              label={formatDayHeader(weekMonday, dayOfWeek)}
              checked={selectedDays.includes(dayOfWeek)}
              onChange={(event) => handleDayToggle(dayOfWeek, event.currentTarget.checked)}
            />
          ))}
        </Stack>

        <Group gap="xs">
          <Button
            variant="light"
            size="xs"
            onClick={handleSelectAll}
            disabled={selectedDays.length === 7}
          >
            Select All
          </Button>
          <Button
            variant="light"
            size="xs"
            onClick={handleClear}
            disabled={selectedDays.length === 0}
          >
            Clear
          </Button>
        </Group>

        <Group
          justify="flex-end"
          pt="md"
          style={{
            borderTop: '1px solid #e9ecef',
            marginTop: '8px',
          }}
        >
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleExport}
            loading={loading}
            disabled={hasNoDaysSelected}
            leftSection={<IconDownload size={16} />}
          >
            Export
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
