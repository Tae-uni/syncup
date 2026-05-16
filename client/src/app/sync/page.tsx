"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CalendarPicker from "@/components/sync/CalendarPicker";
import TimeSelector from "@/components/sync/TimeSelector";
import TimeZoneSelector from "@/components/sync/TimeZoneSelector";
import SyncCreatedSuccess from "@/components/sync/SyncCreatedSuccess";

import { cn } from "@/lib/utils";
import { getUserTimeZone } from "@/lib/timezoneConvert";
import { createSync } from "./syncApi";
import { Calendar1, Clock, Globe } from "lucide-react";

export default function Sync() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeZone, setTimeZone] = useState(getUserTimeZone());
  const [title, setTitle] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [description, setDescription] = useState("")
  const [leaderPasscode, setLeaderPasscode] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [createdSyncId, setCreatedSyncId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timesData, setTimesData] = useState<{
    date: Date;
    start: string;
    end: string;
  }[]>([]);

  const handleSubmit = async () => {
    console.log('Submitting sync data:', {
      title,
      timeSelector: timesData,
      timeZone,
    });

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    if (timesData.length === 0) {
      toast.error('Please add at least one time slot');
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
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      const expiresAt = expiresInDays
        ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const result = await createSync({
        title,
        description,
        timeSelector: timesData.map((t) => ({
          date: t.date,
          startTime: t.start,
          endTime: t.end,
        })),
        timeZone,
        leaderPasscode,
        expiresAt,
      });

      if (result.success && result.data) {
        setCreatedSyncId(result.data.id);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('An error occurred while creating the sync');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdSyncId) {
    return <SyncCreatedSuccess syncId={createdSyncId} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/">
          <span className="text-lg font-semibold tracking-tight">SyncUp</span>
        </Link>
      </nav>

      {/* Page Header */}
      <div className="px-4 sm:px-8 lg:px-16 pt-14 pb-8">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1
              contentEditable
              suppressContentEditableWarning
              onFocus={() => setIsTitleFocused(true)}
              onBlur={(e) => {
                setIsTitleFocused(false);
                setTitle(e.currentTarget.textContent?.trim() || "")
              }}
              data-placeholder="Untitled Sync"
              className={cn(
                "text-3xl font-bold tracking-tight outline-none cursor-text pb-1",
                "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50",
                !title && !isTitleFocused && "border-b-2 border-primary/25 max-w-[220px]"
              )}
            />
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setDescription(e.currentTarget.textContent?.trim() || "")}
              data-placeholder="Add a description..."
              className={
                `text-base text-muted-foreground mt-2 outline-none cursor-text w-fit min-w-[180px]
              border-b border-border pb-0.5
              empty:before:content-[attr(data-placeholder)]
              empty:before:text-muted-foreground/40`
              }
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full border border-border bg-background text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <TimeZoneSelector value={timeZone} onChange={setTimeZone} className="border-0 shadow-none h-auto py-0 text-xs font-normal bg-transparent hover:bg-transparent" />
          </div>

        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 xl:gap-14">
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
                  {selectedDates.length} date{selectedDates.length > 1 ? "s" :
                    ""} selected
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
              />
            </div>
          </div>
          <div className="border-t border-border" />
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex flex-col gap-1.5 w-full sm:w-48">
                <Label className="text-sm" htmlFor="leader-passcode">Leader Passcode</Label>
                <Input
                  id="leader-passcode"
                  type="password"
                  placeholder="4-digit passcode"
                  value={leaderPasscode}
                  onChange={(e) => setLeaderPasscode(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div className="flex flex-col gap-1.5 w-full sm:w-44">
                <Label className="text-sm">Expiration</Label>
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default (3 days)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Sync"}
              </Button>
            </div>

          </div>
      </main>
    </div>
  )
}