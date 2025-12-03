import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Generates a calendar grid for a given month
 * Returns array of days including adjacent month days to fill the grid
 */
export function generateCalendarGrid(year: number, month: number): Array<{
  date: Date;
  dateString: string; // YYYY-MM-DD format
  isCurrentMonth: boolean;
  dayNumber: number;
  isToday: boolean;
}> {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const lastDay = firstDay.endOf('month');

  // Start from Monday of the first week
  const startDay = firstDay.isoWeekday(1);
  // End on Sunday of the last week
  const endDay = lastDay.isoWeekday(7);

  const days: Array<{
    date: Date;
    dateString: string;
    isCurrentMonth: boolean;
    dayNumber: number;
    isToday: boolean;
  }> = [];

  const today = dayjs();
  let current = startDay;

  while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
    const isCurrentMonth = current.month() === month - 1;
    const isToday = current.isSame(today, 'day');

    days.push({
      date: current.toDate(),
      dateString: current.format('YYYY-MM-DD'),
      isCurrentMonth,
      dayNumber: current.date(),
      isToday,
    });

    current = current.add(1, 'day');
  }

  return days;
}

/**
 * Formats a month name from month number
 */
export function formatMonthName(month: number): string {
  return dayjs().month(month - 1).format('MMMM');
}

/**
 * Gets the day of week from a date string (1-7, Monday=1)
 */
export function getDayOfWeekFromDate(dateString: string): number {
  return dayjs(dateString).isoWeekday();
}

/**
 * Formats a date string to a readable format
 */
export function formatDateLong(dateString: string): string {
  return dayjs(dateString).format('dddd, MMMM D, YYYY');
}
