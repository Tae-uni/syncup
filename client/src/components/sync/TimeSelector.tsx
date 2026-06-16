"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface TimeSelectorProps {
  selectedDates: Date[];
  onChange: (timesData: Array<{ date: Date; start: string; end: string }>) => void;
  initialSlots?: Record<string, Array<{ start: string; end: string }>>;
}

const formatDateToLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TimeSelector({ selectedDates, onChange, initialSlots }: TimeSelectorProps) {
  const [dateTimeSlots, setDateTimeSlots] = useState<
    Record<string, Array<{ start: string; end: string }>>
  >(initialSlots || {});

  const addTimeSlot = (date: Date) => {
    const dateKey = formatDateToLocalString(date);
    setDateTimeSlots((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { start: "09:00", end: "10:00" }],
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
                className="text-xs font-medium text-primary hover:opacity-70 transition-opacity"
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
                slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
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
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}