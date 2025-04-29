interface DatePillProps {
  date: Date;
}

export default function DatePill({ date }: DatePillProps) {
  const month = date.toLocaleString('en', { month: 'short' });
  const day = date.getDate();

  return (
    <div className="inline-flex flex-col overflow-hidden items-center gap-x-2 bg-gray-100 rounded-md border border-gray-300">
      <div className="w-full bg-blue-400">
        <span className="text-xs text-white px-3.5">{month}</span>
      </div>
      <div className="h-px w-full bg-gray-200"></div>
      <span className="text-lg font-semibold text-gray-500 py-0.5">{day}</span>
    </div>
  );
}
