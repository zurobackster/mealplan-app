'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Group, Button, Text, Paper } from '@mantine/core';
import { IconChefHat, IconLogout, IconLock } from '@tabler/icons-react';
import { PasswordChangeModal } from '@/components/modals/PasswordChangeModal';

export function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show nav bar on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      <Paper
        shadow="sm"
        p="md"
        style={{
          borderRadius: 0,
          borderBottom: '1px solid #e9ecef',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: '#f2f1d4', // Cream accent
        }}
      >
        <Group justify="space-between">
          {/* Logo/App Name */}
          <Group gap="sm">
            <IconChefHat size={28} color="#4CAF50" stroke={2} />
            <Text size="xl" fw={700} c="dark">
              Meal Planner
            </Text>
          </Group>

          {/* Navigation Links */}
          <Group gap="xs">
            <Button
              variant={pathname === '/' ? 'filled' : 'subtle'}
              color="green"
              onClick={() => router.push('/')}
            >
              Dashboard
            </Button>
            <Button
              variant={pathname === '/planner' ? 'filled' : 'subtle'}
              color="green"
              onClick={() => router.push('/planner')}
            >
              Planner
            </Button>
            <Button
              variant={pathname === '/view-plan' ? 'filled' : 'subtle'}
              color="green"
              onClick={() => router.push('/view-plan')}
            >
              View Plan
            </Button>
          </Group>

          {/* User Actions */}
          <Group gap="xs">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconLock size={18} />}
              onClick={() => setPasswordModalOpened(true)}
            >
              Settings
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </Paper>

      <PasswordChangeModal
        opened={passwordModalOpened}
        onClose={() => setPasswordModalOpened(false)}
      />
    </>
  );
}
