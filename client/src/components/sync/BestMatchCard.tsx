import { DateTime } from "luxon";
import { TimeOptionView, ParticipantView } from "@/types/sync";
import { getUserTimeZone, formatTime } from "@/lib/timezoneConvert";

interface BestMatchCardProps {
  timeOption: TimeOptionView;
  totalParticipants: number;
  participants: ParticipantView[];
  timeZone: string;
  showLocalTime: boolean;
}

export default function BestMatchCard({
  timeOption,
  totalParticipants,
  participants,
  timeZone,
  showLocalTime,
}: BestMatchCardProps) {
  const tz = showLocalTime ? getUserTimeZone() : timeZone;
  const voteCount = timeOption.votes.length;
  const percentage = totalParticipants > 0 ? Math.round((voteCount / totalParticipants) * 100) : 0;

  const formattedDate = DateTime.fromISO(timeOption.startTime).setZone(tz).toFormat("EEEE · MMM d, yyyy");
  const timeRange = `${formatTime(timeOption.startTime, timeZone, showLocalTime)} → ${formatTime(timeOption.endTime, timeZone, showLocalTime)}`;

  const voterIds = new Set(timeOption.votes.map((v) => v.participantId));
  const voters = participants.filter((p) => voterIds.has(p.id));

  return (
    <div className="bg-slate-800 text-white rounded-xl p-6">
      <p className="text-xs text-violet-200 uppercase tracking-widest mb-4">
        Best Match
      </p>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-2xl font-bold mb-1">{formattedDate}</p>
          <p className="text-sm text-violet-200">{timeRange}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold leading-none">
            {percentage}<span className="text-lg font-normal text-violet-200">%</span>
          </p>
          <p className="text-xs text-violet-200 uppercase tracking-wide mt-1">
            {voteCount}/{totalParticipants} Available
          </p>
        </div>
      </div>

      <div className="h-0.5 bg-gray-700 rounded-full mb-4">
        <div className="h-0.5 bg-white rounded-full" style={{ width: `${percentage}%` }} />
      </div>

      <div className="flex justify-end -space-x-2">
        {voters.slice(0, 5).map((voter) => (
          <div 
            key={voter.id} 
            className="w-7 h-7 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-xs font-medium"
          >
            {voter.name[0].toUpperCase()}
          </div>
        ))}
        {voters.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-400">
            +{voters.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}