// Apply the JSDoc to easily understand the function's purpose and usage.

/**
 * Detect the user's timezone from browser(client)
 * @returns The user's timezone (e.g. "Asia/Seoul")
 */

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error("Error getting user timezone:", error);
    return "UTC";
  }
}

/**
 * Convert a date to a specific timezone
 * @param dateStr - The date to convert (YYYY-MM-DD)
 * @param timeStr - The time to convert (HH:MM)
 * @param timeZone - The timezone (e.g. "Asia/Seoul")
 * @returns ISO format string (YYYY-MM-DDTHH:MM:SS.000Z)
 */

export function convertToUTC(dateStr: string, timeStr: string, timeZone: string): string {
  const localDateStr = `${dateStr}T${timeStr}:00`;
  const localDate = new Date(localDateStr);
  return localDate.toISOString();
}

export function formatInTimeZone(utcDate: Date | string, timeZone: string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

  return date.toLocaleString("en-US", { 
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Convert UTC time to local time
 * @param utcTime - The UTC time to convert (YYYY-MM-DDTHH:MM:SS.000Z)
 * @param timeZone - The timezone (e.g. "Asia/Seoul")
 * @returns ISO format string (YYYY-MM-DDTHH:MM:SS.000Z)
 */

export function formatDateInTimeZone(utcDate: Date | string, timeZone: string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

  return date.toLocaleString("en-US", {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}