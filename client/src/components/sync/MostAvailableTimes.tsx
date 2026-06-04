import { TimeOptionView, ParticipantView } from "@/types/sync";
import { timezoneUtils } from "@/lib/timezoneConvert";

interface MostAvailableTimesProps {
  timeOptions: TimeOptionView[];
  totalParticipants: number;
  participants: ParticipantView[];
  timeZone: string;
  showLocalTime: boolean;
}

export default function MostAvailableTimes({
  timeOptions,
  totalParticipants,
  participants,
  timeZone,
  showLocalTime
}: MostAvailableTimesProps) {
  // If no participants, return
  if (totalParticipants === 0) {
    return <p className="bg-secondary text-muted-foreground rounded-lg py-2 px-3 text-sm">No participants yet, share the link and invite people!</p>
  }

  // If no votes, return
  const totalVotes = timeOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
  if (totalVotes === 0) {
    return <p className="bg-secondary text-muted-foreground rounded-lg py-2 px-3">No votes yet, share the link and invite people!</p>
  }

  const sorted = [...timeOptions].sort((a, b) => b.votes.length - a.votes.length);

  function formatDate(dateStr: string) {
    return timezoneUtils.formatDate(dateStr, timeZone, showLocalTime);
  }

  function formatTime(timeStr: string) {
    return timezoneUtils.formatTime(timeStr, timeZone, showLocalTime);
  }

  function getVoterNames(option: TimeOptionView) {
    const names = option.votes.map(v => participants.find(p => p.id === v.participantId)?.name).filter(Boolean) as string[];

    if (names.length <= 3) return names.join(", ");
    return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
  }

  return (
    <div className="divide-y">
      {sorted.map((option, index) => {
        const voteCount = option.votes.length;
        const percentage = totalParticipants > 0 ? Math.round((voteCount / totalParticipants) * 100) : 0;

        return (
          <div key={option.id} className="py-4 flex items-center gap-4">
            <span className="text-xs text-gray-300 font-mono w-6 shrink-0">
              #{String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {formatDate(option.startTime)} · {formatTime(option.startTime)} → {formatTime(option.endTime)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {getVoterNames(option)}
              </p>
              <div className="mt-2 h-1 bg-gray-100 rounded-full">
                <div className="h-1 bg-primary rounded-full" style={{ width: `${percentage}%` }} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold">{percentage}%</p>
              <p className="text-xs text-gray-500">{voteCount}/{totalParticipants}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
}