// Apply the JSDoc to easily understand the function's purpose and usage.

import { DateTime } from 'luxon';
import { TimeZone, getTimeZones } from "@vvo/tzdb";

const allTimeZones = getTimeZones();

export const timezoneUtils = {
  getUserTimeZone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.error("Error getting user timezone:", error);
      return "UTC";
    }
  },

  formatTimeZoneDisplay(timeZoneId: string): string {
    if (!timeZoneId || typeof timeZoneId !== "string") return "Invalid timezone";

    const tzInfo = allTimeZones.find((tz: TimeZone) => tz.name === timeZoneId);
    const cityName = timeZoneId.split('/').pop()?.replace(/_/g, ' ') || timeZoneId;

    if (tzInfo?.countryName) {
      return `${cityName} (${tzInfo.countryName})`;
    }

    return cityName;
  },

  getTimezoneSearchString(timeZone: TimeZone): string {
    const parts = [
      timeZone.name,
      timeZone.name.replace(/\//g, ' '),
      timeZone.countryName,
      timeZone.mainCities?.join(' ')
    ];

    return parts.filter(Boolean).join(' ').toLowerCase();
  },

  formatTime(timeStr: string, timeZone: string, showLocalTime: boolean): string {
    const targetTimeZone = showLocalTime ? getUserTimeZone() : timeZone;
    return DateTime.fromISO(timeStr)
      .setZone(targetTimeZone)
      .toFormat('HH:mm');
  },
  formatDate(dateStr: string, timeZone: string, showLocalTime: boolean): string {
    const targetTimeZone = showLocalTime ? getUserTimeZone() : timeZone;
    console.log(`dateStr: ${dateStr}, timeZone: ${timeZone}, showLocalTime: ${showLocalTime}, targetTimeZone: ${targetTimeZone}`);
    return DateTime.fromISO(dateStr)
      .setZone(targetTimeZone)
      .toFormat('EEE, MMM d');
  },

  formatDateTime(dateStr: string, timeZone: string, showLocalTime: boolean): string {
    const targetTimeZone = showLocalTime ? getUserTimeZone() : timeZone;
    return DateTime.fromISO(dateStr)
      .setZone(targetTimeZone)
      .toFormat('EEE, MMM d, HH:mm');
  }
};

export const dateTimeUtils = {
  toUTC(dateStr: string, timeStr: string, timeZone: string): string {
    const localDateTime = DateTime.fromFormat(
      `${dateStr} ${timeStr}`,
      'yyyy-MM-dd HH:mm',
      { zone: timeZone }
    );

    return localDateTime.toUTC().toISO() || '';
  },

  formatInTimeZone(date: Date | string, timeZone: string, format: 'time' | 'date' | 'datetime' = 'datetime'): string {
    const dateTime = DateTime.fromJSDate(new Date(date)).setZone(timeZone);

    switch (format) {
      case 'time':
        return dateTime.toFormat('HH:mm');
      case 'date':
        return dateTime.toFormat('MMM d');
      case 'datetime':
        return dateTime.toFormat('MMM d, HH:mm');
      default:
        return dateTime.toFormat('MMM d, HH:mm');
    }
  },

  formatTimeRange(startTime: string, endTime: string, timeZone: string, showLocalTime: boolean = false): string {
    try {
      const start = DateTime.fromISO(startTime).setZone(timeZone);
      const end = DateTime.fromISO(endTime).setZone(timeZone);

      const dateStr = start.toFormat('MMM d');
      const timeStr = `${start.toFormat('HH:mm')} - ${end.toFormat('HH:mm')}`;
      const tzDisplay = timeZone.split('/').pop()?.replace(/_/g, ' ') || timeZone;

      return `${dateStr} ${timeStr} (${tzDisplay})`;
    } catch (error) {
      console.error('Error formatting time range:', error);
      return 'Invalid date';
    }
  }
};

export const {
  getUserTimeZone,
  formatTimeZoneDisplay,
  getTimezoneSearchString,
  formatTime,
  formatDate,
  formatDateTime
} = timezoneUtils;

export const {
  toUTC: convertToUTC,
  formatInTimeZone,
  formatTimeRange
} = dateTimeUtils;

/**
 * Get timezones grouped by continent
 * @returns Object with continents as keys and timezones as values
 */

// export function getTimezonesGroupedByContinent(): Record<string, TimeZone[]> {
//   const groups: Record<string, TimeZone[]> = {};

//   allTimeZones.forEach((tz: TimeZone) => {
//     // The first part before the first slash is the continent
//     const continent = tz.name.split('/')[0];

//     // If the continent group doesn't exist, create it
//     if (!groups[continent]) {
//       groups[continent] = [];
//     }

//     groups[continent].push(tz);
//   });

//   return groups;
// }

/**
 * Format a date in a specific timezone
 * @param date - The date to format (Date or string)
 * @param timeZone - The timezone (e.g. "Asia/Seoul")
 * @returns Formatted date string (HH:MM)
 */

export function formatTimeInTimeZone(utcDate: Date | string, timeZone: string): string {
  const date = new Date(utcDate);

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
  const date = new Date(utcDate);

  return date.toLocaleString("en-US", {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time in selected timezone
 * @param dateStr - The date to format (YYYY-MM-DD)
 * @param startTime - The start time to format (HH:MM)
 * @param endTime - The end time to format (HH:MM)
 * @param timeZone - The timezone (e.g. "Asia/Seoul")
 * @returns Formatted date string (MMM D, HH:MM)
 */

export function formatTimeInSelectedTimeZone(
  dateStr: string,
  startTime: string,
  endTime: string,
  timeZone: string,

): string {
  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date:', { startTime, endTime });
      return 'Invalid date';
    }

    const formattedDate = startDate.toLocaleDateString('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
    });

    const formattedStartTime = startDate.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const formattedEndTime = endDate.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const tzDisplay = timeZone.split('/').pop()?.replace(/_/g, ' ') || timeZone;

    // return `${formattedDate} ${formattedStartTime} - ${formattedEndTime} (${tzDisplay})`;
    return `${formattedStartTime} - ${formattedEndTime}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid date';
  }
}

/**
 * Format time in user local timezone
 * @param dateStr - The date to format (YYYY-MM-DD)
 * @param startTime - The start time to format (HH:MM)
 * @param endTime - The end time to format (HH:MM)
 * @param timeZone - The timezone (e.g. "Asia/Seoul")
 * @returns Formatted date string (MMM D, HH:MM)
 */

export function formatTimeInUserLocalTimeZone(
  dateStr: string,
  startTime: string,
  endTime: string,
  sourceTimeZone: string,
): string {
  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date:', { startTime, endTime });
      return 'Invalid date';
    }

    const userTimeZone = getUserTimeZone();

    const userFormattedDate = startDate.toLocaleDateString('en-US', {
      timeZone: userTimeZone,
      month: 'short',
      day: 'numeric',
    });

    const userFormattedStartTime = startDate.toLocaleTimeString('en-US', {
      timeZone: userTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const userFormattedEndTime = endDate.toLocaleTimeString('en-US', {
      timeZone: userTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const userTzDisplay = userTimeZone.split('/').pop()?.replace(/_/g, ' ') || userTimeZone;

    // return `${userFormattedDate} ${userFormattedStartTime} - ${userFormattedEndTime} (${userTzDisplay} - your local time)`;
    return `${userFormattedStartTime} - ${userFormattedEndTime}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return 'Invalid date';
  }
}
