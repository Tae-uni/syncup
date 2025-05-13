"use client";

import { useState } from "react";
import { MdCheck, MdEdit } from "react-icons/md";

import { SyncData, VoteSubmitData } from "@/types/sync";
import { formatDateInTimeZone, formatTimeInTimeZone } from "@/lib/timezoneConvert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface VoteFormProps {
  syncData: SyncData['data'];
  onSubmit: (data: VoteSubmitData) => void;
}

export default function VoteForm({ syncData, onSubmit }: VoteFormProps) {
  const [name, setName] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const { sync } = syncData;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (newName && sync.participants?.some(p => p.name === newName)) {
      const participant = sync.participants.find(p => p.name === newName);
      if (participant) {
        const votedOptionIds = sync.timeOptions
          .filter(opt => opt.votes.some(v => v.participantId === participant.id))
          .map(opt => opt.id);

        setSelectedTimes(votedOptionIds);
        setIsUpdate(true);
      }
    } else {
      setIsUpdate(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ participantName: name, timeOptionIds: selectedTimes });
  };

  const toggleTimeOption = (timeOptionId: string) => {
    setSelectedTimes(prev =>
      prev.includes(timeOptionId)
        ? prev.filter(id => id !== timeOptionId)
        : [...prev, timeOptionId]
    );
  };

  const groupedByDate = sync.timeOptions.reduce((acc, option) => {
    const date = formatDateInTimeZone(option.date, sync.timeZone);
    if (!acc[date]) acc[date] = [];
    acc[date].push(option);
    return acc;
  }, {} as Record<string, typeof sync.timeOptions>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isUpdate && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg mb-4 flex items-center">
          <MdEdit className="mr-2 flex-shrink-0" />
          <p className="text-sm">
            You have already voted for <strong>{name}</strong>. Please update your vote.
          </p>
        </div>
      )}

      { /* Step indicator */}
      {/* <div className="bg-white rounded-lg p-4 mb-2 border-l-4 border-orange-400">
        <p className="text-sm text-gray-600">
          Please complete the form below to vote for the best time for the group.
        </p>
      </div> */}

      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-md font-medium">
          Your Name
          {isUpdate && <span className="text-blue-600 text-xs ml-2">Updating existing vote</span>}
        </label>
        <Input
          id="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter your name"
          required
          className={`w-full ${isUpdate ? 'border-blue-300 bg-blue-50' : ''}`}
        />
      </div>

      {/* Time Options */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Available Times</h3>
        <div className="space-y-3">
          {Object.entries(groupedByDate).map(([date, options]) => (
            <div key={date} className="mb-4">
              <div className="font-semibold text-gray-700 mb-2">{date}</div>
              <div className="flex flex-wrap gap-3">
                {options.map(option => (
                  <label key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedTimes.includes(option.id)}
                      onCheckedChange={() => toggleTimeOption(option.id)}
                    />
                    <span className="text-sm">
                      {formatTimeInTimeZone(option.startTime, sync.timeZone)} - {formatTimeInTimeZone(option.endTime, sync.timeZone)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex">
        <Button
          type="submit"
          className="min-w-[160px] px-6 py-2 rounded-lg bg-teal-500 text-white font-semibold hover:opacity-90 transition-opacity"
          disabled={!name || selectedTimes.length === 0}
        >
          <MdCheck className="inline mr-2" />
          {isUpdate ? "Update Vote" : "Submit Vote"}
        </Button>
      </div>
    </form>
  );
}