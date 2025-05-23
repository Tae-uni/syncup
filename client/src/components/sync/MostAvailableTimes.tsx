import { DateTime } from "luxon";
import { SyncData } from "@/types/sync";
import { timezoneUtils } from "@/lib/timezoneConvert";

interface MostAvailableTimesProps {
  timeOptions: SyncData["data"]["sync"]["timeOptions"];
  totalParticipants: number;
  timeZone: string;
  limit?: number;
  showLocalTime: boolean;
}

export default function MostAvailableTimes({
  timeOptions,
  totalParticipants,
  timeZone,
  limit = 2,
  showLocalTime
}: MostAvailableTimesProps) {
  // If no participants, return
  if (totalParticipants === 0) {
    return <p className="bg-orange-100 text-orange-700 rounded-lg py-2 px-3 text-sm">No participants yet, share the link and invite people!</p>
  }

  // If no votes, return
  const totalVotes = timeOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
  if (totalVotes === 0) {
    return <p className="bg-orange-100 text-orange-700 rounded-lg py-2 px-3">No votes yet, share the link and invite people!</p>
  }

  // Get the most available times
  const mostAvailableTimes = getMostAvailableTimes(timeOptions, totalParticipants, limit);

  // Format the date (Full)
  function formatDate(dateStr: string) {
    const targetTimeZone = showLocalTime ? timezoneUtils.getUserTimeZone() : timeZone;
    return DateTime.fromISO(dateStr)
      .setZone(targetTimeZone)
      .toFormat('EEEE, MMMM d, yyyy');
  }

  function formatTime(timeStr: string, timeZone: string) {
    // return formatTimeInTimeZone(timeStr, timeZone).slice(0, 5);
    return timezoneUtils.formatTime(timeStr, timeZone, showLocalTime).slice(0, 5);
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
                <h4 className="font-medium text-md">{formatDate(time.date)}</h4>
                <p className="text-gray-600 text-sm">
                  {formatTime(time.startTime, timeZone)} - {formatTime(time.endTime, timeZone)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-teal-600">
                  {time.percentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {time.voteCount} / {totalParticipants} participants
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${time.percentage > 80 ? 'bg-gradient-to-r from-teal-500 to-orange-400' : 'bg-teal-500'}`}
                style={{ width: `${time.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getMostAvailableTimes(
  timeOptions: SyncData["data"]["sync"]["timeOptions"],
  totalParticipants: number,
  limit?: number
) {
  const voteCountMap = timeOptions.map(opt => ({
    date: opt.startTime,
    startTime: opt.startTime,
    endTime: opt.endTime,
    voteCount: opt.votes.length,
    percentage: totalParticipants === 0 ? 0 : Math.round((opt.votes.length / totalParticipants) * 100),
  }));

  return voteCountMap
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}