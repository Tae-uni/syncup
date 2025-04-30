import { SyncData } from "@/types/sync";

export function buildHeatmapData(
  timeOptions: SyncData["timeOptions"],
  dates: string[],
  timeBlocks: string[]
) {
  // Mapping of date and time block to number of votes
  const voteMap = new Map<string, number>();

  timeOptions.forEach(opt => {
    // Handle time ranges
    const startTime = opt.startTime.slice(0, 5);
    const endTime = opt.endTime.slice(0, 5);

    const startIdx = timeBlocks.indexOf(startTime);
    const endIdx = timeBlocks.indexOf(endTime);

    if (startIdx !== -1) {
      // Set votes for this time block
      const key = `${opt.date}_${startTime}`;
      voteMap.set(key, opt.votes.length);
    }
  });

  // Build heatmap data
  const data: { x: number, y: number, value: number, date: string, time: string }[] = [];
  dates.forEach((date, xIdx) => {
    timeBlocks.forEach((block, yIdx) => {
      const key = `${date}_${block}`;
      data.push({
        x: xIdx,
        y: yIdx,
        value: voteMap.get(key) ?? 0,
        date,
        time: block,
      });
    });
  });

  return data;
}