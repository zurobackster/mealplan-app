'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      notifications.show({
        title: 'Error',
        message: 'Please enter username and password',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Login Failed',
          message: data.error || 'Invalid credentials',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Success',
        message: 'Login successful!',
        color: 'green',
      });

      // Redirect to planner
      router.push('/planner');
    } catch (error) {
      console.error('Login error:', error);
      notifications.show({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <Paper
          shadow="md"
          p="xl"
          radius="md"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Title order={1} ta="center" mb="md" c="violet">
            Meal Planner
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="xl">
            Sign in to manage your weekly meals
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
                size="md"
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                size="md"
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={loading}
                mt="md"
              >
                Sign In
              </Button>

              <Text c="dimmed" size="xs" ta="center" mt="sm">
                Default credentials: admin / admin123
              </Text>
            </Stack>
          </form>
        </Paper>
      </div>
    </Container>
  );
}
