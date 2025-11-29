import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Get the Monday of the week containing the given date
 * @param date - Any date in the week
 * @returns Monday of that week
 */
export function getMonday(date: Date | string): Date {
  const d = dayjs(date);
  return d.isoWeekday(1).toDate();
}

/**
 * Format week range as "Jan 1 - Jan 7"
 * @param monday - Monday of the week
 * @returns Formatted string
 */
export function formatWeekRange(monday: Date | string): string {
  const start = dayjs(monday);
  const end = start.add(6, 'days');

  if (start.month() === end.month()) {
    // Same month: "Jan 1 - 7"
    return `${start.format('MMM D')} - ${end.format('D')}`;
  } else {
    // Different months: "Jan 29 - Feb 4"
    return `${start.format('MMM D')} - ${end.format('MMM D')}`;
  }
}

/**
 * Get day of week (1-7, Monday = 1)
 * @param date - Date to check
 * @returns Day of week number
 */
export function getDayOfWeek(date: Date | string): number {
  return dayjs(date).isoWeekday();
}

/**
 * Get array of dates for a week starting from Monday
 * @param monday - Monday of the week
 * @returns Array of 7 dates
 */
export function getWeekDates(monday: Date | string): Date[] {
  const start = dayjs(monday);
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'days').toDate());
}

/**
 * Format date as ISO string for API (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatISODate(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Get name of day (Monday, Tuesday, etc.)
 * @param dayOfWeek - Day number (1-7, Monday = 1)
 * @returns Day name
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayOfWeek - 1] || '';
}

/**
 * Get short name of day (Mon, Tue, etc.)
 * @param dayOfWeek - Day number (1-7, Monday = 1)
 * @returns Short day name
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[dayOfWeek - 1] || '';
}

/**
 * Format day header with date (e.g., "Wed, Nov 26")
 * @param monday - Monday of the week
 * @param dayOfWeek - Day number (1-7, Monday = 1)
 * @returns Formatted day header
 */
export function formatDayHeader(monday: Date | string, dayOfWeek: number): string {
  const start = dayjs(monday);
  const targetDate = start.add(dayOfWeek - 1, 'days');
  return targetDate.format('ddd, MMM D');
}
