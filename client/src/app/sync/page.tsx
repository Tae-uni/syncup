"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CalendarPicker from "@/components/sync/CalendarPicker";
import TimeSelector from "@/components/sync/TimeSelector";
import DatePill from "@/components/sync/DatePill";
import { Button } from "@/components/ui/button";
import TimeZoneSelector from "@/components/sync/TimeZoneSelector";

import { getUserTimeZone } from "@/lib/timezoneConvert";

import { createSync } from "./syncApi";

export default function Sync() {
  useEffect(() => {
    fetch('http://localhost:5002/api/test')
      .then(res => res.json())
      .then(data => console.log('Ping response:', data))
      .catch(err => console.error('Ping error:', err));
  }, []);

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeZone, setTimeZone] = useState(getUserTimeZone());
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timesData, setTimesData] = useState<{
    date: Date;
    start: string;
    end: string;
  }[]>([]);

  const handleSubmit = async () => {
    console.log('Submitting sync data:', {
      title,
      // description: document.getElementById('sync-description')?.value,
      timeSelector: timesData,
      timeZone,
    });

    if (!title) {
      alert('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const description = document.getElementById('sync-description') as HTMLTextAreaElement;

      const result = await createSync({
        title,
        description: description.value,
        timeSelector: timesData.map(t => ({
          date: t.date,
          startTime: t.start,
          endTime: t.end,
        })),
        timeZone: timeZone,
      });

      if (result.success) {
        alert('Sync created successfully');
      } else {
        alert(result.error);
      }
    } catch {
      alert('An error occurred while creating the sync');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header>
        <h1 className="text-4xl font-bold text-center mt-20">
          Create a New Sync
        </h1>
      </header>
      <main className="flex flex-col items-center justify-center p-10">
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="timezone-label" className="text-lg mt-8 block text-left">
            Timezone
          </Label>
          <div className="mt-2">
            <TimeZoneSelector value={timeZone} onChange={setTimeZone} />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            The timezone of the sync will be automatically set to your browser's timezone.
          </p>
        </div>
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="sync-title" className="text-lg mt-8 block text-left">
            Sync Title
          </Label>
          <Input
            id="sync-title"
            type="text"
            placeholder="Enter the title"
            className="border border-gray-300 rounded-md p-2 mt-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="sync-description" className="text-lg mt-8 block text-left">
            Sync Description
          </Label>
          <Textarea
            id="sync-description"
            name="description"
            placeholder="Enter the description"
            className="border border-gray-300 rounded-md p-2 mt-2 w-full"
            rows={3}
            cols={40}
          >
          </Textarea>
        </div>


        {/* Sync Calendar */}
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="sync-dates" className="text-lg mt-8 block text-left">
            Sync Dates
          </Label>
          <div className="border border-gray-300 rounded-md p-2 mt-2 w-full">
            <CalendarPicker
              onSelectDate={(dates: Date[] | undefined) => setSelectedDates(dates || [])}
              selected={selectedDates}
              maxDates={10}
            />
            {selectedDates.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedDates.map((date, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    {date.toLocaleDateString()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Pills */}
        {/* <div className="flex flex-wrap gap-2">
          {selectedDates.map((date, index) => (
            <DatePill key={index} date={date} />
          ))}
        </div> */}

        {/* Time Selector */}
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="sync-dates" className="text-lg mt-8 block text-left">
            Sync Times
          </Label>
          <div className="border border-gray-300 rounded-md p-2 mt-2 w-full">
            <TimeSelector
              selectedDates={selectedDates}
              onChange={setTimesData}
            />
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-8">
          <Button type="button" variant="outline" className="mr-4">Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-500 text-white hover:bg-blue-600">
            {isSubmitting ? 'Creating...' : 'Create Sync'}
          </Button>
        </div>
      </main>
    </>
  )
}