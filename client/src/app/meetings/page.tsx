"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CalendarPicker from "@/components/CalendarPicker";
import DatePill from "@/components/DatePill";

export default function Meetings() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  return (
    <>
      <header>
        <h1 className="text-4xl font-bold text-center mt-20">
          Create a New Meeting
        </h1>
      </header>
      <main className="flex flex-col items-center justify-center p-20">
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="meeting-title" className="text-lg mt-8 block text-left">
            Meeting Title
          </Label>
          <Input
            id="meeting-title"
            type="text"
            placeholder="Enter the title"
            className="border border-gray-300 rounded-md p-2 mt-2 w-full"
          />
        </div>
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="meeting-description" className="text-lg mt-8 block text-left">
            Meeting Description
          </Label>
          <Textarea
            id="meeting-description"
            placeholder="Enter the description"
            className="border border-gray-300 rounded-md p-2 mt-2 w-full"
            rows={3}
            cols={40}
          >
          </Textarea>
        </div>

        {/* Meeting Calendar */}
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="meeting-dates" className="text-lg mt-8 block text-left">
            Meeting Dates
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

        {/* Time Slots */}
        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="meeting-dates" className="text-lg mt-8 block text-left">
            Meeting Times
          </Label>
        </div>

      </main>
    </>
  )
}