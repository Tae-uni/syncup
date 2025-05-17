"use client";

import { useState } from "react";
import { MdCancel, MdCheck, MdEdit, MdAccessTime } from "react-icons/md";
import { DateTime } from "luxon";

import { SyncData, VoteSubmitData } from "@/types/sync";
import { formatTimeInSelectedTimeZone, formatTimeInUserLocalTimeZone, getUserTimeZone } from "@/lib/timezoneConvert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { Switch } from "@/components/ui/switch";

interface VoteFormProps {
  syncData: SyncData['data'];
  onSubmit: (data: VoteSubmitData) => void;
  onCancel: (participantName: string) => void;
}

export default function VoteForm({ syncData, onSubmit, onCancel }: VoteFormProps) {
  const [name, setName] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [showLocalTime, setShowLocalTime] = useState(false);

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
    const targetTimeZone = showLocalTime ? getUserTimeZone() : sync.timeZone;

    const zonedDate = DateTime
      .fromISO(option.startTime, { zone: 'utc' })
      .setZone(targetTimeZone);

    const formattedDate = zonedDate.toFormat('EEE, MMM d');

    if (!acc[formattedDate]) acc[formattedDate] = [];
    acc[formattedDate].push(option);
    return acc;
  }, {} as Record<string, typeof sync.timeOptions>);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isUpdate && (
        <div className="p-3 bg-teal-50 text-teal-700 rounded-md mb-4 flex items-center">
          <MdEdit className="mr-2 flex-shrink-0" />
          <p className="text-sm">
            You've already voted as <strong>{name}</strong>. You can update or cancel your vote below.
          </p>
        </div>
      )}

      {/* Name Input */}
      <div className="relative mb-6 max-w-md">
        <Input
          id="name"
          placeholder=" "
          value={name}
          onChange={handleNameChange}
          required
          className={`peer h-10 w-full rounded-md border px-3 pt-5 pb-2 focus:ring-2 focus:ring-teal-400 ${isUpdate ? 'border-teal-400 bg-teal-50' : ''}`}
        />
        <Label
          htmlFor="name"
          className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
        >
          Enter your name
        </Label>
      </div>

      {/* Time Options */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Select Available Times</h3>
          <div className="flex items-center gap-2">
            <MdAccessTime className="text-gray-500" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show local time</span>
              <Switch
                checked={showLocalTime}
                onCheckedChange={setShowLocalTime}
                className="data-[state=checked]:bg-teal-500"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, options]) => (
            <div key={date} className="border rounded-lg p-3 bg-gray-50 mb-4">
              <div className="font-medium text-gray-800 mb-2">
                {date}
                {showLocalTime && (
                  <span className="text-sm text-gray-500 ml-2">
                    (shown in your local time)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {options.map(option => {
                  console.log('Time option', {
                    date: option.date,
                    startTime: option.startTime,
                    endTime: option.endTime,
                    timeZone: sync.timeZone,
                    showLocalTime: showLocalTime,
                  })

                  return (
                    <label key={option.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={option.id}
                        checked={selectedTimes.includes(option.id)}
                        onCheckedChange={() => toggleTimeOption(option.id)}
                      />
                      {showLocalTime ? (
                        // Host timezone
                        formatTimeInUserLocalTimeZone(
                          option.date,
                          option.startTime,
                          option.endTime,
                          sync.timeZone
                        )
                      ) : (
                        // User local timezone
                        formatTimeInSelectedTimeZone(
                          option.date,
                          option.startTime,
                          option.endTime,
                          sync.timeZone
                        )
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4">
        <p className="text-sm text-gray-500">
          {selectedTimes.length === 0 ? (
            "Please select at least one time option"
          ) : (
            `${selectedTimes.length} time option${selectedTimes.length > 1 ? 's' : ''} selected`
          )}
        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          {isUpdate && (
            <Button
              type="button"
              onClick={() => name && onCancel(name)}
              className="flex-1 sm:flex-none px-2 py-5 rounded-lg font-semibold bg-orange-400 text-white hover:opacity-90 shadow-md hover:shadow-lg"
              disabled={!name}
            >
              <MdCancel className="mr-1" />
              Cancel Vote
            </Button>
          )}
          <Button
            type="submit"
            className={`flex-1 sm:flex-none px-2 py-5 rounded-lg font-semibold transition-all ${!name || selectedTimes.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-500 text-white hover:opacity-90 shadow-md hover:shadow-lg'
              }`}
            disabled={!name || selectedTimes.length === 0}
          >
            <MdCheck className="mr-1" />
            {isUpdate ? "Update Vote" : "Submit Vote"}
          </Button>
        </div>
      </div>
    </form>
  );
}