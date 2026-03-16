"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import CalendarPicker from "@/components/sync/CalendarPicker";
import TimeZoneSelector from "@/components/sync/TimeZoneSelector";
import TimeSelector from "@/components/sync/TimeSelector";

import { formatInTimeZone } from "@/lib/timezoneConvert";
import { getSync, updateSync, deleteSync } from "@/app/sync/syncApi";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSync(syncId, passcode);
      if (result.success) {
        toast.success("Sync deleted successfully");
        router.push("/");
      } else {
        toast.error(result.error ?? "Failed to delete sync");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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
        <div className="flex justify-between mt-8 w-full max-w-md">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Sync
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
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
        </div>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sync</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure want to delete this sync? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}