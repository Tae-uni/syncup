"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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

        <div className="flex flex-col w-full max-w-md">
          <Label htmlFor="meeting-dates" className="text-lg mt-8 block text-left">
            Meeting Dates
          </Label>
          <div className="border border-gray-300 rounded-md p-2 mt-2 w-full">
          </div>
        </div>
      </main>
    </>
  )
}