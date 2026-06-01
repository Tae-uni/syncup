"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdPersonAdd, MdPersonAddAlt1, MdVisibility } from "react-icons/md";

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
  // const [isExpanded, setIsExpanded] = useState(false);
  const { sync } = syncData;

  // const toggleExpanded = () => {
  //   setIsExpanded(!isExpanded);
  // }

  if (!sync.participants || sync.participants.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
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
                <p className="text-xs text-gray-400 mt-1 tracking-wide uppercase">
                  {participant.voteCount} votes
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-400">
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
            <p className="text-xs text-gray-400 italic">No picks yet</p>
          )}
        </div>
      ))}
    </div>
  )
}

//   // Get participant votes data
//   const getParticipantVotes = () => {
//     return sync.participants.map(participant => {
//       // Get time options voted by the participant
//       const votedOptions = sync.timeOptions.filter(opt =>
//         opt.votes.some(vote => vote.participantId === participant.id)
//       );

//       const formattedVotes = votedOptions.map(opt => {
//         const date = timezoneUtils.formatDate(opt.startTime, timeZone, showLocalTime);
//         const startTime = timezoneUtils.formatTime(opt.startTime, timeZone, showLocalTime);
//         const endTime = timezoneUtils.formatTime(opt.endTime, timeZone, showLocalTime);

//         console.log(`date: ${date}, startTime: ${startTime}, endTime: ${endTime}`);
//         return `${date} / ${startTime}-${endTime}`;
//       });

//       return {
//         id: participant.id,
//         name: participant.name,
//         votes: formattedVotes,
//         voteCount: formattedVotes.length
//       };
//     });
//   };

//   const participantVotes = getParticipantVotes();

//   return (
//     <div className="mt-8">
//       {/* Collapsible section */}
//       <button
//         onClick={toggleExpanded}
//         className="w-full mb-4 flex items-center justify-between p-3 bg-teal-50 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors"
//       >
//         <div className="flex items-center space-x-2">
//           <MdPersonAdd className="text-xl" />
//           <span className="font-semibold text-lg">Participant Details ({sync.participants.length})</span>
//         </div>
//         {
//           isExpanded ?
//             <MdKeyboardArrowUp className="text-xl" /> :
//             <MdKeyboardArrowDown className="text-xl" />
//         }
//       </button>

//       {isExpanded && (
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           {participantVotes.map(participant => (
//             <div
//               key={participant.id}
//               className="bg-white rounded-lg border shadow-sm p-4 hover:border-teal-400 transition-colors"
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-medium">
//                     {participant.name.charAt(0)}
//                   </div>
//                   <h3 className="font-medium">{participant.name}</h3>
//                 </div>
//                 <span className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-full">
//                   {participant.voteCount} votes
//                 </span>
//               </div>

//               {participant.votes.length > 0 ? (
//                 <ul className="space-y-1 text-sm">
//                   {participant.votes.map((vote, index) => (
//                     <li key={index} className="text-gray-600 truncate" title={vote}>
//                       • {vote}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-gray-500 italic">No votes yet</p>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }