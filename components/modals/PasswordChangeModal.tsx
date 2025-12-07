'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  PasswordInput,
  Button,
  Group,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface PasswordChangeModalProps {
  opened: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({
  opened,
  onClose,
}: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  // Validation logic
  const validateForm = (): string | null => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'All fields are required';
    }

    if (newPassword.length < 6) {
      return 'New password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }

    if (currentPassword === newPassword) {
      return 'New password must be different from current password';
    }

    return null;
  };

  const handleSubmit = async () => {
    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      notifications.show({
        title: 'Validation Error',
        message: validationError,
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        notifications.show({
          title: 'Error',
          message: data.error || 'Failed to update password',
          color: 'red',
        });
        return;
      }

      // Success handling
      notifications.show({
        title: 'Success',
        message: 'Password updated successfully',
        color: 'green',
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Password update error:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Change Password"
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Enter your current password and choose a new password.
        </Text>

        <PasswordInput
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.currentTarget.value)}
          required
          disabled={loading}
        />

        <PasswordInput
          label="New Password"
          placeholder="Enter new password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          required
          disabled={loading}
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          required
          disabled={loading}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            color="violet"
          >
            Update Password
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
