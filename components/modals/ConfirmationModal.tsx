'use client';

import { Modal, Stack, Text, Group, Button, Center } from '@mantine/core';
import { useEffect } from 'react';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  icon,
  loading = false,
}: ConfirmationModalProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, loading, onConfirm]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      size="sm"
      centered
      padding="lg"
    >
      <Stack gap="md" align="center">
        {icon && (
          <Center
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${confirmColor}-0)`,
            }}
          >
            {icon}
          </Center>
        )}

        <Stack gap="xs" align="center">
          <Text size="lg" fw={600} ta="center">
            {title}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {message}
          </Text>
        </Stack>

        <Group justify="center" mt="md" w="100%">
          <Button
            variant="subtle"
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {cancelLabel}
          </Button>
          <Button
            color={confirmColor}
            onClick={onConfirm}
            loading={loading}
            style={{ flex: 1 }}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
