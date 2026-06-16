import { Calendar } from "@/components/ui/calendar";

interface CalendarPickerProps {
  onSelectDate: (dates: Date[] | undefined) => void;
  selected: Date[];
  maxDates?: number;
}

export default function CalendarPicker({
  onSelectDate,
  selected,
  maxDates = 10,
}: CalendarPickerProps) {
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
    <Calendar
      mode="multiple"
      selected={selected}
      onSelect={handleSelect}
      disabled={{ before: new Date() }}
      className="rounded-xl border border-gray-300 bg-white shadow-sm w-full p-4"
      classNames={{
        head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-0.5",
        day: "h-10 w-10 p-0 font-normal rounded-full aria-selected:opacity-100",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_today: "border border-primary/40 text-foreground font-medium rounded-md",
        day_disabled: "text-muted-foreground/40 cursor-not-allowed",
      }}
    />
  );
}