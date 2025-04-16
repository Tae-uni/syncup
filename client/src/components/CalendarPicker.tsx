import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";

interface CalendarPickerProps {
  onSelectDate: (dates: Date[] | undefined) => void;
  selected: Date[];
  maxDates?: number;
}

export default function CalendarPicker({
  onSelectDate,
  selected,
  maxDates = 10
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      onSelectDate(dates);
      return;
    }

    if (dates.length > maxDates) {
      onSelectDate(dates.slice(0, maxDates));
      return;
    }

    onSelectDate(dates);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !selected?.length && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Pick a date</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="multiple"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}