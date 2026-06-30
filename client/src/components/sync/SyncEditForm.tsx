"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { Globe, Calendar1, Clock } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [votedSlots, setVotedSlots] = useState<Record<string, Array<{ start: string; end: string; voteCount: number }>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
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
        const voted: Record<string, Array<{ start: string; end: string; voteCount: number }>> = {};
        sync.timeOptions.forEach(option => {
          if (option.votes.length > 0) {
            const dateKey = new Date(option.startTime).toLocaleDateString('en-CA', {
              timeZone: sync.timeZone,
            });
            const startStr = formatInTimeZone(option.startTime, sync.timeZone, 'time');
            const endStr = formatInTimeZone(option.endTime, sync.timeZone, 'time');
            if (!voted[dateKey]) voted[dateKey] = [];
            voted[dateKey].push({ start: startStr, end: endStr, voteCount: option.votes.length });
          }
        });
        setVotedSlots(voted);
      }
      setIsLoading(false);
    };

    fetchSync();
  }, [syncId]);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
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

    const hasDuplicateSlots = timesData.some((slot, i) =>
      timesData.slice(i + 1).some(other =>
        slot.date.toDateString() === other.date.toDateString() &&
        slot.start === other.start &&
        slot.end === other.end
      )
    );
    if (hasDuplicateSlots) {
      toast.error("Please remove duplicate time slots");
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
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col border-t-8 border-primary">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">SyncUp</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            <span>✏️</span>
            Editing
          </span>
        </div>
        <Link href={`/sync/${syncId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <MdArrowBack /> Back to sync
        </Link>
      </nav>

      {/* page header */}
      <div className="px-4 sm:px-8 lg:px-16 pt-14 pb-8">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Sync"
              className="text-4xl font-bold tracking-tight border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none h-auto py-1 max-w-xl"
            />
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="text-lg border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none h-auto py-1 text-muted-foreground max-w-xl"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <TimeZoneSelector
              value={timeZone}
              onChange={setTimeZone}
              className="border-0 shadow-none h-auto py-0 text-xs font-normal bg-transparent hover:bg-transparent"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 xl:gap-14">
            {/* Calendar */}
            <div className="flex flex-col gap-3 mx-auto lg:mx-0 lg:flex-none">
              <div className="flex items-center gap-1.5">
                <Calendar1 className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Dates</Label>
              </div>
              <CalendarPicker
                onSelectDate={(dates) => setSelectedDates(dates || [])}
                selected={selectedDates}
                maxDates={10}
              />
              {selectedDates.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Times</Label>
              </div>
              <TimeSelector
                selectedDates={selectedDates}
                onChange={setTimesData}
                initialSlots={initialSlots}
                votedSlots={votedSlots}
                submitAttempted={submitAttempted}
              />
            </div>
          </div>

          <div className="border-t border-border" />
          {/* Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete Sync
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white" onClick={() => router.push(`/sync/${syncId}`)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Sync"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sync</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
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
    </div>
  );
}