import { enUS } from "date-fns/locale";
import { format } from "date-fns";

import { SyncData } from "@/types/sync";
import { formatInTimeZone } from "@/lib/timezoneConvert";

interface MostAvailableTimesProps {
  timeOptions: SyncData["data"]["timeOptions"];
  totalParticipants: number;
  limit?: number;
}

export default function MostAvailableTimes({
  timeOptions,
  totalParticipants,
  limit = 2
}: MostAvailableTimesProps) {
  // If no participants, return
  if (totalParticipants === 0) {
    return <p className="bg-[rgb(255,208,177)] rounded-lg py-2 px-3 text-sm">No participants yet, share the link and invite people!</p>
  }

  // If no votes, return
  const totalVotes = timeOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
  if (totalVotes === 0) {
    return <p className="bg-[#ff9248] text-white rounded-lg py-2 px-3">No votes yet, share the link and invite people!</p>
  }

  // Get the most available times
  const mostAvailableTimes = getMostAvailableTimes(timeOptions, totalParticipants, limit);

  // Format the date (remove seconds)
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const formattedDate = format(date, "MMM d, yyyy", { locale: enUS });
    return formattedDate;
    // const date = parse(dateStr, "yyyy-MM-dd", new Date());
    // return format(date, "MMM d, yyyy", { locale: enUS });
  }

  function formatTime(timeStr: string) {
    // return timeStr.slice(0, 5);
    return formatInTimeZone(timeStr, "UTC").slice(0, 5);
  }

  return (
    <div className="mt-4">
      <div className="space-y-4">
        {mostAvailableTimes.map((time, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{formatDate(time.date)}</h4>
                <p className="text-gray-600">
                  {formatTime(time.startTime)} - {formatTime(time.endTime)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {time.percentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {time.voteCount} / {totalParticipants} participants
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${time.percentage}%` }}>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getMostAvailableTimes(
  timeOptions: SyncData["data"]["timeOptions"],
  totalParticipants: number,
  limit?: number
) {
  const voteCountMap = timeOptions.map(opt => ({
    date: opt.date,
    startTime: opt.startTime,
    endTime: opt.endTime,
    voteCount: opt.votes.length,
    percentage: totalParticipants === 0 ? 0 : Math.round((opt.votes.length / totalParticipants) * 100),
  }));

  return voteCountMap
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}