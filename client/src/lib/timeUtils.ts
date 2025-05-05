import { SyncData } from "@/types/sync";

// Get all selected time blocks including the extended range
export function getAllSelectedTimeBlocks(timeOptions: SyncData["data"]["timeOptions"]) {
  const blocks = new Set<string>();

  // Add 9:00-17:00 in 30min increments
  for (let hour = 9; hour < 17; hour++) {
    blocks.add(`${hour.toString().padStart(2, "0")}:00`);
    blocks.add(`${hour.toString().padStart(2, "0")}:30`);
  }
  blocks.add('17:00');

  // Add any additional blocks from time options
  timeOptions.forEach(opt => {
    const startDate = new Date(opt.startTime);
    const endDate = new Date(opt.endTime);

    // blocks.add(start);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

    const startTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);

    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    let currentHour = startHour;
    let currentMinute = startMinute;

    // Add blocks in 30min increments between start and end
    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }

      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      blocks.add(timeStr);
    }
  });

  return Array.from(blocks).sort((a, b) => {
    const [aHour, aMinute] = a.split(':').map(Number);
    const [bHour, bMinute] = b.split(':').map(Number);

    if (aHour !== bHour) return aHour - bHour;
    return aMinute - bMinute;
  });
}

export function createVoteDataMap(timeOptions: SyncData["data"]["timeOptions"], timeBlocks: string[]) {
  const voteData = new Map<string, number>();

  timeOptions.forEach(opt => {
    const startTime = opt.startTime.slice(0, 5);
    const endTime = opt.endTime.slice(0, 5);

    const startIdx = timeBlocks.indexOf(startTime);
    const endIdx = timeBlocks.indexOf(endTime);

    if (startIdx !== -1 && endIdx !== -1) {
      for (let i = startIdx; i <= endIdx; i++) {
        const key = `${opt.date}_${timeBlocks[i]}`;
        voteData.set(key, (voteData.get(key) || 0) + opt.votes.length);
      }
    }
  });

  return voteData;
}

export function formatDate(isoDateString: string) {
  const date = new Date(isoDateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(isoTimeString: string) {
  const date = new Date(isoTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateAndTime(isoString: string) {
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}
