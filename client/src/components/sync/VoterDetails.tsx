"use client";

import { DateTime } from "luxon";
import { MdVisibility } from "react-icons/md";

import { timezoneUtils } from "@/lib/timezoneConvert";
import { GetSyncPayload } from "@/types/sync";

interface VoterDetailsProps {
  syncData: GetSyncPayload;
  timeZone: string;
  showLocalTime: boolean;
}

export default function VoterDetails({
  syncData,
  timeZone,
  showLocalTime
}: VoterDetailsProps) {
  const { sync } = syncData;

  if (!sync.participants || sync.participants.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No participants yet. Share the link to invite people.
      </p>
    );
  }

  const targetZone = showLocalTime ? timezoneUtils.getUserTimeZone() : timeZone;

  const participantVotes = sync.participants.map((participant) => {
    const votedOptions = sync.timeOptions.filter((opt) =>
      opt.votes.some((vote) => vote.participantId === participant.id)
    );

    const chips = votedOptions.map((opt) =>
      DateTime.fromISO(opt.startTime)
        .setZone(targetZone)
        .toFormat("EEE MMM d · HH:mm")
    );

    return {
      id: participant.id,
      name: participant.name,
      chips,
      voteCount: chips.length,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {participantVotes.map((participant) => (
        <div
          key={participant.id}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-semibold">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-base leading-none">
                  {participant.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 tracking-wide uppercase">
                  {participant.voteCount} votes
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MdVisibility className="text-sm" /> Picks
            </span>
          </div>

          {participant.chips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {participant.chips.map((chip, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No picks yet</p>
          )}
        </div>
      ))}
    </div>
  )
}