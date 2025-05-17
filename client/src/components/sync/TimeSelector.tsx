"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// TODO: Add a time zone selector, automatically set the time zone based on the user's location.

interface TimeSelectorProps {
  selectedDates: Date[];
  onChange: (timesData: Array<{ date: Date; start: string; end: string }>) => void;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

export default function TimeSelector({ selectedDates, onChange }: TimeSelectorProps) {
  // 각 날짜별 시간 슬롯을 관리하는 상태
  const [dateTimeSlots, setDateTimeSlots] = useState<Record<string, Array<{ start: string; end: string }>>>({});

  const formatDateToLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add time slot to a specific date
  const addTimeSlot = (date: Date) => {
    const dateKey = formatDateToLocalString(date);
    setDateTimeSlots(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { start: "09:00", end: "10:00" }]
    }));
  };

  // Update a specific time slot
  const updateTimeSlot = (date: Date, index: number, field: 'start' | 'end', value: string) => {
    const dateKey = formatDateToLocalString(date);
    setDateTimeSlots(prev => {
      const slots = [...(prev[dateKey] || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [dateKey]: slots };
    });
  };

  // Remove a time slot
  const removeTimeSlot = (date: Date, index: number) => {
    const dateKey = formatDateToLocalString(date);
    setDateTimeSlots(prev => {
      const slots = [...(prev[dateKey] || [])];
      slots.splice(index, 1);
      return { ...prev, [dateKey]: slots };
    });
  };

  // Update parent component when time slots change
  useEffect(() => {
    const timesData: Array<{ date: Date; start: string; end: string }> = [];

    Object.entries(dateTimeSlots).forEach(([dateStr, slots]) => {
      const date = new Date(dateStr);
      slots.forEach(({ start, end }) => {
        timesData.push({ date, start, end });
      });
    });

    onChange(timesData);
  }, [dateTimeSlots, onChange]);

  return (
    <div className="space-y-6">
      {selectedDates.length === 0 ? (
        <p className="text-gray-500 text-center">Please select dates first</p>
      ) : (
        selectedDates.map((date) => {
          const dateKey = formatDateToLocalString(date);
          const slots = dateTimeSlots[dateKey] || [];

          return (
            <div key={dateKey} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(date)}
                >
                  Add Time Slot
                </Button>
              </div>

              {slots.length === 0 ? (
                <p className="text-sm text-gray-500">No time slots added</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(date, index, 'start', e.target.value)}
                        className="border rounded p-2"
                      >
                        {timeOptions.map((time) => (
                          <option key={`start-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <span>to</span>
                      <select
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(date, index, 'end', e.target.value)}
                        className="border rounded p-2"
                      >
                        {timeOptions.map((time) => (
                          <option key={`end-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(date, index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}