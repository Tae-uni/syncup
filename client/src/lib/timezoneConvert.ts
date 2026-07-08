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
  }
};

export const {
  getUserTimeZone,
  formatTimeZoneDisplay,
  getTimezoneSearchString,
  formatTime,
  formatDate
} = timezoneUtils;

export const {
  toUTC: convertToUTC,
  formatInTimeZone
} = dateTimeUtils;

export function formatTimeInSelectedTimeZone(
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

    return `${formattedStartTime} - ${formattedEndTime}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid date';
  }
}

export function formatTimeInUserLocalTimeZone(
  startTime: string,
  endTime: string,
): string {
  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date:', { startTime, endTime });
      return 'Invalid date';
    }

    const userTimeZone = getUserTimeZone();

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

    return `${userFormattedStartTime} - ${userFormattedEndTime}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return 'Invalid date';
  }
}
