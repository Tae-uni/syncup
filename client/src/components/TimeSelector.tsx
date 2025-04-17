"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";

// TODO: Add a time zone selector, automatically set the time zone based on the user's location.

interface TimeSelectorProps {
  selectedDates: Date[];
  onChange: (timeData: { date: Date, start: string, end: string }[]) => void;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

export default function TimeSelector({ selectedDates, onChange }: TimeSelectorProps) {
  const [dateTimes, setDateTimes] = useState<{ date: Date, start: string, end: string }[]>([]);

  useEffect(() => {
    const times = selectedDates.map(date => ({
      date,
      start: "09:00",
      end: "17:00"
    }));

    setDateTimes(times);
    onChange(times);
  }, [selectedDates, onChange]);

  // Update the time
  const updateTime = (index: number, field: 'start' | 'end', value: string) => {
    const newTimes = [...dateTimes];
    newTimes[index] = { ...newTimes[index], [field]: value };

    setDateTimes(newTimes);
    onChange(newTimes);
  };

  if (selectedDates.length === 0) {
    return <p className="text-sm text-gray-500">No dates selected</p>
  }

  return (
    <div className="space-y-3">
      {dateTimes.map((item, index) => (
        <div key={index} className="border rounded-md p-4">
          <div className="text-sm font-medium">
            {item.date.toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2 pt-1 w-full">
            <Select value={item.start} onValueChange={(v) => updateTime(index, 'start', v)}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`start-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="mx-2">~</span>

            <Select value={item.end} onValueChange={(v) => updateTime(index, 'end', v)}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`end-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}