"use client";

import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdPersonAdd, MdPersonAddAlt1 } from "react-icons/md";

import { formatTimeInTimeZone, formatDateInTimeZone } from "@/lib/timezoneConvert";
import { SyncData } from "@/types/sync";

interface VoterDetailsProps {
  syncData: SyncData['data'];
  timeZone: string;
}

export default function VoterDetails({
  syncData,
  timeZone,
}: VoterDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { sync } = syncData;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  }

  if (!sync.participants || sync.participants.length === 0) {
    return (
      <div className="container flex flex-col justify-center items-center mx-auto px-4 py-44 max-w-4xl mb-2 bg-orange-50 rounded-lg">
        <MdPersonAddAlt1 className="text-orange-400 text-4xl mb-2" />
        <p className="text-lg font-medium">No participants yet</p>
        <p className="text-gray-500 text-sm text-center">Share the link and invite people!</p>
      </div>
    )
  }

  // Get participant votes data
  const getParticipantVotes = () => {
    return sync.participants.map(participant => {
      // Get time options voted by the participant
      const votedOptions = sync.timeOptions.filter(opt =>
        opt.votes.some(vote => vote.participantId === participant.id)
      );

      const formattedVotes = votedOptions.map(opt => {
        const date = formatDateInTimeZone(opt.date, timeZone);
        const startTime = formatTimeInTimeZone(opt.startTime, timeZone);
        const endTime = formatTimeInTimeZone(opt.endTime, timeZone);

        return `${date} / ${startTime}-${endTime}`;
      });

      return {
        id: participant.id,
        name: participant.name,
        votes: formattedVotes,
        voteCount: formattedVotes.length
      };
    });
  };

  const participantVotes = getParticipantVotes();

  return (
    <div className="mt-8">
      {/* Collapsible section */}
      <button 
        onClick={toggleExpanded}
        className="w-full mb-4 flex items-center justify-between p-3 bg-teal-50 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <MdPersonAdd className="text-xl" />
          <span className="font-semibold text-lg">Participant Details ({sync.participants.length})</span>
        </div>
        {
          isExpanded ?
            <MdKeyboardArrowUp className="text-xl" /> :
            <MdKeyboardArrowDown className="text-xl" />
        }
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {participantVotes.map(participant => (
            <div
              key={participant.id}
              className="bg-white rounded-lg border shadow-sm p-4 hover:border-teal-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-medium">
                    {participant.name.charAt(0)}
                  </div>
                  <h3 className="font-medium">{participant.name}</h3>
                </div>
                <span className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-full">
                  {participant.voteCount} votes
                </span>
              </div>

              {participant.votes.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {participant.votes.map((vote, index) => (
                    <li key={index} className="text-gray-600 truncate" title={vote}>
                      • {vote}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No votes yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}