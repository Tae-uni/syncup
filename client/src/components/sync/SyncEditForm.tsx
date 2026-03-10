"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import CalendarPicker from "@/components/sync/CalendarPicker";
import TimeZoneSelector from "@/components/sync/TimeZoneSelector";
import TimeSelector from "@/components/sync/TimeSelector";

import { formatInTimeZone } from "@/lib/timezoneConvert";
import { getSync, updateSync } from "@/app/sync/syncApi";

interface Props {
  syncId: string;
  passcode: string;
}

export default function SyncEditForm({ syncId, passcode }: Props) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [initialSlots, setInitialSlots] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [timesData, setTimesData] = useState<{ date: Date; start: string; end: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSync = async () => {
      setIsLoading(true);
      const result = await getSync(syncId);

      if (result.success && result.data) {
        const sync = result.data.sync;
        setTitle(sync.title);
        setDescription(sync.description || "");
        setTimeZone(sync.timeZone);

        const dates: Date[] = [];
        const slots: Record<string, Array<{ start: string; end: string }>> = {};

        sync.timeOptions.forEach(option => {
          const dateKey = new Date(option.startTime).toLocaleDateString('en-CA', {
            timeZone: sync.timeZone,
          });

          const startStr = formatInTimeZone(option.startTime, sync.timeZone, 'time');
          const endStr = formatInTimeZone(option.endTime, sync.timeZone, 'time');

          const [year, month, day] = dateKey.split('-').map(Number);
          const dateObj = new Date(year, month - 1, day);

          if (!dates.find(d => d.toDateString() === dateObj.toDateString())) {
            dates.push(dateObj);
          }

          if (!slots[dateKey]) slots[dateKey] = [];
          slots[dateKey].push({ start: startStr, end: endStr });
        });

        setSelectedDates(dates);
        setInitialSlots(slots);
      }
      setIsLoading(false);
    };

    fetchSync();
  }, [syncId]);

  const handleSubmit = async () => {
    // UI improvement: change to inline error for UI later.
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    if (timesData.length === 0) {
      toast.error("Please add at least one time slot");
      return;
    }

    const hasDateWithoutSlot = selectedDates.some(
      date => !timesData.some(t => t.date.toDateString() === date.toDateString())
    );

    if (hasDateWithoutSlot) {
      toast.error("Please add at least one time slot for each selected date");
      return;
    }

    const hasInvalidTime = timesData.some(t => t.start >= t.end);
    if (hasInvalidTime) {
      toast.error("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateSync(syncId, {
        title,
        description,
        timeZone,
        timeSelector: timesData.map(t => ({
          date: t.date,
          startTime: t.start,
          endTime: t.end,
        })),
        leaderPasscode: passcode,
      });

      if (result.success) {
        toast.success("Sync updated successfully");
        router.push(`/sync/${syncId}`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <>
      <header>
        <h1 className="text-4xl font-bold text-center mt-20">Edit Sync</h1>
      </header>
      <main className="flex flex-col items-center justify-center p-10">
        <div className="flex flex-col w-full max-w-md">
          <Label className="text-lg mt-8 block text-left">Timezone</Label>
          <div className="mt-2">
            <TimeZoneSelector value={timeZone} onChange={setTimeZone} />
          </div>
        </div>
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="edit-title" className="text-lg mt-8 block text-left">Sync Title</Label>
          <Input
            id="edit-title"
            type="text"
            placeholder="Enter the title"
            className="border border-gray-300 rounded-md p-2 mt-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="edit-description" className="text-lg mt-8 block text-left">Sync Description</Label>
          <Textarea
            id="edit-description"
            placeholder="Enter the description"
            className="border border-gray-300 rounded-md p-2 mt-2 w-full"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full max-w-md">
          <Label className="text-lg mt-8 block text-left">Sync Dates</Label>
          <div className="border border-gray-300 rounded-md p-2 mt-2 w-full">
            <CalendarPicker
              onSelectDate={(dates: Date[] | undefined) => setSelectedDates(dates || [])}
              selected={selectedDates}
              maxDates={10}
            />
          </div>
        </div>
        <div className="flex flex-col w-full max-w-md">
          <Label className="text-lg mt-8 block text-left">Sync Times</Label>
          <div className="border border-gray-300 rounded-md p-2 mt-2 w-full">
            <TimeSelector
              selectedDates={selectedDates}
              onChange={setTimesData}
              initialSlots={initialSlots}
            />
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <Button
            type="button"
            variant="outline"
            className="mr-4"
            onClick={() => router.push(`/sync/${syncId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {isSubmitting ? "Updating..." : "Update Sync"}
          </Button>
        </div>
      </main>
    </>
  );
}