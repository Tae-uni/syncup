"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TimeSelectorProps {
  selectedDates: Date[];
  onChange: (timesData: Array<{ date: Date; start: string; end: string }>) => void;
  initialSlots?: Record<string, Array<{ start: string; end: string }>>;
  votedSlots?: Record<string, Array<{ start: string; end: string; voteCount: number }>>;
}

const formatDateToLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TimeSelector({ selectedDates, onChange, initialSlots, votedSlots }: TimeSelectorProps) {
  const [dateTimeSlots, setDateTimeSlots] = useState<
    Record<string, Array<{ start: string; end: string }>>
  >(initialSlots || {});

  const MAX_TIME_OPTIONS = 20;
  const totalSlots = Object.values(dateTimeSlots).reduce((sum, s) => sum + s.length, 0);
  const isAtLimit = totalSlots >= MAX_TIME_OPTIONS;


  const addTimeSlot = (date: Date) => {
    if (isAtLimit) return;

    const dateKey = formatDateToLocalString(date);
    const existing = dateTimeSlots[dateKey] || [];
    const newSlot = { start: "09:00", end: "10:00" };

    if (existing.some(s => s.start === newSlot.start && s.end === newSlot.end)) {
      toast.error("This time slot already exists");
      return;
    }

    setDateTimeSlots((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newSlot],
    }));
  };

  const updateTimeSlot = (date: Date, index: number, field: "start" | "end",
    value: string) => {
    const dateKey = formatDateToLocalString(date);
    setDateTimeSlots((prev) => {
      const slots = [...(prev[dateKey] || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [dateKey]: slots };
    });
  };

  const removeTimeSlot = (date: Date, index: number) => {
    const dateKey = formatDateToLocalString(date);
    setDateTimeSlots((prev) => {
      const slots = [...(prev[dateKey] || [])];
      slots.splice(index, 1);
      return { ...prev, [dateKey]: slots };
    });
  };

  useEffect(() => {
    if (initialSlots && Object.keys(initialSlots).length > 0) {
      setDateTimeSlots(initialSlots);
    }
  }, [initialSlots]);

  useEffect(() => {
    const selectedDateKeys = new Set(selectedDates.map(formatDateToLocalString));
    setDateTimeSlots(prev => {
      const next: typeof prev = {};
      for (const key of Object.keys(prev)) {
        if (selectedDateKeys.has(key)) next[key] = prev[key];
      }
      return next;
    });
  }, [selectedDates]);

  useEffect(() => {
    const timesData: Array<{ date: Date; start: string; end: string }> = [];
    Object.entries(dateTimeSlots).forEach(([dateStr, slots]) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      slots.forEach(({ start, end }) => {
        timesData.push({ date, start, end });
      });
    });
    onChange(timesData);
  }, [dateTimeSlots, onChange]);

  return (
    <div className="space-y-2.5">
      {selectedDates.map((date) => {
        const dateKey = formatDateToLocalString(date)
        const slots = dateTimeSlots[dateKey] || []

        return (
          <div
            key={dateKey}
            className="rounded-lg border border-border overflow-hidden bg-card"
          >
            {/* Date header */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
              <span className="text-xs font-medium text-foreground">
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <button
                type="button"
                onClick={() => addTimeSlot(date)}
                disabled={isAtLimit}
                className="text-xs font-medium text-primary hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add time slot
              </button>
            </div>

            {/* Slot rows */}
            <div className="px-3 py-2.5 space-y-2">
              {slots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-0.5">
                  No time slots yet.
                </p>
              ) : (
                slots.map((slot, index) => {
                  const isDuplicate = slots.filter(
                    s => s.start === slot.start && s.end === slot.end
                  ).length > 1;

                  return (
                    <div key={index} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            updateTimeSlot(date, index, 'start', e.target.value)
                          }
                          className="h-8 w-[130px] rounded-md border border-input bg-white px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <span className="text-xs text-muted-foreground">→</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            updateTimeSlot(date, index, 'end', e.target.value)
                          }
                          className="h-8 w-[130px] rounded-md border border-input bg-white px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(date, index)}
                          className="ml-auto flex items-center justify-center w-6 h-6 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {(() => {
                        const voted = votedSlots?.[dateKey]?.find(v => v.start === slot.start && v.end === slot.end);
                        return voted ? (
                          <p className="flex items-center gap-1 text-xs text-amber-600 pl-1 py-0.5">
                            ⚠️ {voted.voteCount} vote{voted.voteCount > 1 ? "s" : ""} - changing this will reset votes
                          </p>
                        ) : null;
                      })()}
                      {isDuplicate && (
                        <p className="text-xs text-destructive pl-1 py-0.5">
                          Duplicate time slot
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
      {isAtLimit && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Maximum of 20 time slots reached
        </p>
      )}
    </div>
  )
}