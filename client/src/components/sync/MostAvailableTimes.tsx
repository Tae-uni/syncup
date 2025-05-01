import { SyncData } from "@/types/sync";
import { enUS } from "date-fns/locale";
import { parse, format } from "date-fns";

interface MostAvailableTimesProps {
  timeOptions: SyncData["timeOptions"];
  totalParticipants: number;
  limit?: number;
}

export default function MostAvailableTimes({
  timeOptions,
  totalParticipants,
  limit = 2
}: MostAvailableTimesProps) {
  // Get the most available times
  const mostAvailableTimes = getMostAvailableTimes(timeOptions, totalParticipants, limit);

  // Format the date (remove seconds)
  function formatDate(dateStr: string) {
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    return format(date, "MMM d, yyyy", { locale: enUS });
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5);
  }

  return (
    <div className="mt-4">
      {mostAvailableTimes.length === 0 ? (
        <p className="text-gray-500">No votes yet</p>
      ) : (
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
      )}
    </div>
  );
}

function getMostAvailableTimes(
  timeOptions: SyncData["timeOptions"],
  totalParticipants: number,
  limit?: number
) {
  const voteCountMap = timeOptions.map(opt => ({
    date: opt.date,
    startTime: opt.startTime,
    endTime: opt.endTime,
    voteCount: opt.votes.length,
    percentage: Math.round((opt.votes.length / totalParticipants) * 100),
  }));

  return voteCountMap
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}