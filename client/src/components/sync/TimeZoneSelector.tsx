"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { TimeZone, getTimeZones } from "@vvo/tzdb";

import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { formatTimeZoneDisplay, getTimezoneSearchString } from "@/lib/timezoneConvert";
import { cn } from "@/lib/utils";

interface TimeZoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TimeZoneSelector({ value, onChange, className }: TimeZoneSelectorProps) {
  const allTimeZones = useMemo(() => getTimeZones(), []);

  const [userTimeZone, setUserTimeZone] = useState("");
  const [open, setOpen] = useState(false);

  const selectedLabel = formatTimeZoneDisplay(value);

  const timeZonesFiltered = useMemo(() => {
    return allTimeZones.map((tz: TimeZone) => {
      if (!tz.name || typeof tz.name !== "string") {
        console.error("Invalid timezone name:", tz);
      }

      return {
        label: formatTimeZoneDisplay(tz.name),
        value: tz.name,
        search: getTimezoneSearchString(tz),
      }
    });
  }, [allTimeZones]);

  useEffect(() => {
    try {
      const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimeZone(localTimeZone);

      if (!value && localTimeZone) {
        onChange(localTimeZone);
      }
    } catch (error) {
      console.error("Error fetching time zones:", error);

      if (!value) {
        onChange("UTC");
      }
    }
  }, [value, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className={cn("w-full justify-between", className)}>
          {value ? selectedLabel : "Select a time zone"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 overflow-hidden">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {timeZonesFiltered.map((tz) => (
                <CommandItem
                  key={tz.value}
                  value={tz.value}
                  onSelect={() => {
                    onChange(tz.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === tz.value ? "opacity-100" : "opacity-0")}
                  />
                  {tz.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}