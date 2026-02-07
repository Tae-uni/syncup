"use client";

import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { MdCancel, MdCheck, MdEdit } from "react-icons/md";

import { GetSyncPayload, VoteSubmitData } from "@/types/sync";
import { formatTimeInSelectedTimeZone, formatTimeInUserLocalTimeZone, getUserTimeZone } from "@/lib/timezoneConvert";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VoteFormProps {
  syncData: GetSyncPayload;
  onSubmit: (data: VoteSubmitData) => void | Promise<void>;
  onCancel: (participantName: string, passcode: string) => void | Promise<void>;
  showLocalTime: boolean;
  formKey?: number;
  error?: string | null;
}

export default function VoteForm({ syncData, onSubmit, onCancel, showLocalTime, formKey, error }: VoteFormProps) {
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const displayError = localError ?? error;
  const { sync } = syncData;

  useEffect(() => {
    if (formKey !== undefined && formKey > 0) {
      setName("");
      setPasscode("");
      setSelectedTimes([]);
      setLocalError(null);
    }
  }, [formKey]);

  const isUpdate = Boolean(name && sync.participants?.some(p => p.name === name));

  useEffect(() => {
    if (!name) {
      setSelectedTimes([]);
      return;
    }

    const participant = sync.participants?.find(p => p.name === name);
    if (participant) {
      const votedOptionIds = sync.timeOptions
        .filter(opt => opt.votes.some(v => v.participantId === participant.id))
        .map(opt => opt.id);
      setSelectedTimes(votedOptionIds);
    } else {
      setSelectedTimes([]);
    }
  }, [syncData, name, sync.participants, sync.timeOptions]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setLocalError(null);
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPasscode(value);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 4) {
      setLocalError("Please enter a 4-digit passcode");
      return;
    }

    if (selectedTimes.length === 0) {
      setLocalError("Please select at least one time option");
      return;
    }
    
    onSubmit({
      participantName: name,
      timeOptionIds: selectedTimes,
      passcode: passcode,
    });
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

      {/* Name and Passcode Inputs */}
      <div className="space-y-2 max-w-md">
        <div className="relative">
          <Input
            id="name"
            placeholder=" "
            value={name}
            onChange={handleNameChange}
            required
            className={`peer h-10 w-full rounded-md border px-3 pt-5 pb-2 focus:ring-2 focus:ring-teal-400 ${
              isUpdate ? 'border-teal-400 bg-teal-50' : ''
            }`}
          />
          <Label 
            htmlFor="name"
            className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
          >
            Enter your name
          </Label>
        </div>

        <div className="relative">
          <Input
            id="passcode"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder=" "
            value={passcode}
            onChange={handlePasscodeChange}
            required
            className={`peer h-10 w-full rounded-md border px-3 pt-5 pb-2 focus:ring-2 focus:ring-teal-400 ${
              displayError ? 'border-red-400' : ''
            }`}
          />
          <Label
            htmlFor="passcode"
            className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
          >
            {isUpdate ? 'Enter your passcode' : 'Create a 4-digit passcode'}
          </Label>
          {displayError ? (
            <p className="text-xs text-red-500 mt-1">{displayError}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              {isUpdate
                ? 'Enter your passcode to update your vote'
                : 'Remember this code to edit your vote later'}
            </p>
          )}
        </div>
      </div>

      {/* Time Options */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Select Available Times</h3>
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
              onClick={() => {
                if (passcode.length === 4) {
                  setShowCancelDialog(true);
                } else {
                  setLocalError("Please enter your passcode to cancel");
                }
              }}
              className="flex-1 sm:flex-none px-2 py-5 rounded-lg font-semibold bg-orange-400 text-white hover:opacity-90 shadow-md hover:shadow-lg"
              disabled={!name || passcode.length !== 4}
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

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Your Vote?</DialogTitle>
            <DialogDescription>
              This will remove all your vote selections and your participation from this sync. You can vote again later with a new passcode.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep My Vote
            </Button>
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                setShowCancelDialog(false);
                onCancel(name, passcode);
              }}
            >
              Yes, Cancel Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}