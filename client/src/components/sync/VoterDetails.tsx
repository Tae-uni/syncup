"use client";

import { parse, format } from "date-fns";
import { enUS } from "date-fns/locale";
import { MdPersonAddAlt1 } from "react-icons/md";
import { SyncData } from "@/types/sync";

interface VoterDetailsProps {
  syncData: SyncData['data'];
  dates: string[];
  timeBlocks: string[];
}

export default function VoterDetails({
  syncData,
  dates,
  timeBlocks,
}: VoterDetailsProps) {
  if (!syncData.participants || syncData.participants.length === 0) {
    return (
      <div className="container flex flex-col justify-center items-center mx-auto px-4 py-44 max-w-4xl mb-2 bg-slate-100 rounded-lg">
        <MdPersonAddAlt1 className="text-gray-400 text-4xl mb-2" />
        <p className="text-lg">No participants yet</p>
        <p className="text-gray-500 text-sm text-center">Share the link and invite people!</p>
      </div>
    )
  }

  // Format date
  const formatDate = (date: string) => {
    const dateObj = parse(date, 'yyyy-MM-dd', new Date());
    return format(dateObj, 'EEE, MMM d', { locale: enUS });
  };

  const formatTime = (time: string) => {
    return time; 
  };

  // Get participant votes data
  const getParticipantVotes = () => {
    return syncData.participants.map(participant => {
      // Get time options voted by the participant
      const votedOptions = syncData.timeOptions.filter(opt => 
        opt.votes.some(vote => vote.participantId === participant.id)
      );
      
      const formattedVotes = votedOptions.map(opt => {
        const date = formatDate(opt.date);
        const startTime = formatTime(opt.startTime.slice(0, 5));
        const endTime = formatTime(opt.endTime.slice(0, 5));
        
        return `${date} ${startTime}-${endTime}`;
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
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {participantVotes.map(participant => (
          <div 
            key={participant.id} 
            className="bg-white rounded-lg border shadow-sm p-4 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                  {participant.name.charAt(0)}
                </div>
                <h3 className="font-medium">{participant.name}</h3>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
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
    </div>
  );
}