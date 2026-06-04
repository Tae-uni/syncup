"use client";

import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { MdCancel, MdCheck, MdEdit, MdPerson, MdLock } from "react-icons/md";

import { GetSyncPayload, VoteSubmitData } from "@/types/sync";
import { formatTimeInSelectedTimeZone, formatTimeInUserLocalTimeZone, getUserTimeZone } from "@/lib/timezoneConvert";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-0.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative flex items-center">
            <MdPerson className="absolute left-3 text-gray-400" />
            <Input
              placeholder="Your name"
              value={name}
              onChange={handleNameChange}
              required
              className="pl-9 bg-white"
            />
          </div>
          <div className="relative flex items-center">
            <MdLock className="absolute left-3 text-gray-400" />
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="4-digit passcode"
              value={passcode}
              onChange={handlePasscodeChange}
              required
              className={`pl-9 bg-white ${displayError ? "border-red-400" : ""}`}
            />
          </div>
        </div>
        {displayError && (
          <p className="text-xs text-red-500 mt-2">{displayError}</p>
        )}
        {isUpdate && !displayError && (
          <p className="text-xs text-primary mt-2 flex items-center gap-1">
            <MdEdit className="text-sm" />
            Updating vote for <strong>{name}</strong> - enter passcode to confirm
          </p>
        )}
      </div>

      {/* Time Options */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Available Times</p>
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, options]) => (
            <div key={date}>
              <p className="text-sm font-semibold text-gray-900 mb-2">{date}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(option => {
                  const isSelected = selectedTimes.includes(option.id);
                  const timeLabel = showLocalTime
                    ? formatTimeInUserLocalTimeZone(option.date, option.startTime, option.endTime, sync.timeZone)
                    : formatTimeInSelectedTimeZone(option.date, option.startTime, option.endTime, sync.timeZone);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleTimeOption(option.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
                        isSelected
                          ? "bg-indigo-950 text-white border-indigo-950" 
                          : "bg-white text-indigo-950 border-violet-200 hover:bg-violet-100"}`}
                    >
                      {timeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t pt-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {selectedTimes.length === 0
            ? "Pick at least one slot"
            : `${selectedTimes.length} slot${selectedTimes.length > 1 ? "s" : ""} selected`}
        </p>
        <div className="flex gap-2">
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
              className="bg-orange-400 text-white hover:opacity-90"
              disabled={!name || passcode.length !== 4}
            >
              <MdCancel className="mr-1" />
              Cancel Vote
            </Button>
          )}
          <Button
            type="submit"
            disabled={!name || selectedTimes.length === 0}
            className={`${!name || selectedTimes.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
              }`}
          >
            <MdCheck className="mr-1" />
            {isUpdate ? "Update Vote" : "Submit vote"}
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Your Vote?</DialogTitle>
            <DialogDescription>
              This will remove all your vote selections and your participation
              from this sync. You can vote again later with a new passcode.
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