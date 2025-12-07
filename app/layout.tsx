import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";
import { TopNavBar } from '@/components/common/TopNavBar';

export const metadata: Metadata = {
  title: "Meal Planner",
  description: "Weekly meal planning made easy",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

const theme = createTheme({
  primaryColor: 'green',
  colors: {
    green: [
      '#E8F5E9',  // green-0 (lightest)
      '#C8E6C9',  // green-1
      '#A5D6A7',  // green-2
      '#81C784',  // green-3
      '#66BB6A',  // green-4
      '#4CAF50',  // green-5 (primary - matches reference)
      '#43A047',  // green-6
      '#388E3C',  // green-7
      '#2E7D32',  // green-8
      '#1B5E20',  // green-9 (darkest)
    ],
    // Keep violet for backward compatibility
    violet: [
      '#f3e5f5',
      '#e1bee7',
      '#ce93d8',
      '#ba68c8',
      '#ab47bc',
      '#9c27b0',
      '#8e24aa',
      '#7b1fa2',
      '#6a1b9a',
      '#4a148c',
    ],
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',  // Increased from default 600
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          <TopNavBar />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
