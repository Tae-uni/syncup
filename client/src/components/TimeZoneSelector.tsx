"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";

interface TimeZoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const COMMON_TIMEZONES = ["UTC", "GMT", "America/New_York", "America/Los_Angeles", "America/Chicago", "America/Toronto", "America/Mexico_City", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Dubai", "Asia/Kolkata", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Istanbul", "Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Pacific/Honolulu", "Pacific/Auckland", "Pacific/Fiji"];


export default function TimeZoneSelector({ value, onChange, className }: TimeZoneSelectorProps) {
  const [userTimeZone, setUserTimeZone] = useState("");

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
  }, []);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a time zone" />
        </SelectTrigger>
        <SelectContent>
          {/* User timezone */}
          {userTimeZone && !COMMON_TIMEZONES.includes(userTimeZone) && (
            <SelectItem value={userTimeZone}>
              {userTimeZone}
            </SelectItem>
          )}
          
          {/* Common timezones */}
          {COMMON_TIMEZONES.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz} {tz === userTimeZone ? "(Selected)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}