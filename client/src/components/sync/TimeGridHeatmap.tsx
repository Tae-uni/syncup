import { useState } from "react";
import { enUS } from "date-fns/locale";
import { parse, format } from "date-fns";

interface TimeGridHeatmapProps {
  dates: string[];
  timeBlocks: string[];
  voteData: Map<string, number>;
  totalParticipants: number;
}

export default function TimeGridHeatmap({
  dates,
  timeBlocks,
  voteData,
  totalParticipants,
}: TimeGridHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ show: boolean, content: string, x: number, y: number }>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });

  const formatDates = dates.map(date => {
    const dateObj = parse(date, 'yyyy-MM-dd', new Date());
    return {
      monthDay: format(dateObj, 'MMM d', { locale: enUS }),
      weekday: format(dateObj, 'EEE', { locale: enUS }),
      original: date
    };
  });

  // Calculate color based on votes ratio
  const getColor = (votes: number) => {
    if (votes === 0) return 'bg-gray-100';
    const ratio = votes / totalParticipants;

    if (ratio <= 0.2) return 'bg-blue-100';
    if (ratio <= 0.4) return 'bg-blue-200';
    if (ratio <= 0.6) return 'bg-blue-300';
    if (ratio <= 0.8) return 'bg-blue-400';

    return 'bg-blue-500';
  };

  return (
    <div className="mt-8 flex flex-row gap-12">
      {formatDates.map((date, i) => (
        <div key={i} className="flex flex-col items-center">
          {/* Date Header */}
          <div className="mb-4">
            <div className="text-md text-gray-600 text-center">{date.monthDay}</div>
            <div className="text-2xl font-bold text-center mb-3">{date.weekday}</div>
          </div>
          {/* Time + Heatmap */}
          <div className="flex flex-col">
            {timeBlocks.map((time, idx) => {
              const key = `${date.original}_${time}`;
              const votes = voteData.get(key) || 0;

              // let background = "";
              // if (idx % 2 === 0 && votes > 0) {
              //   background = "linear-gradient(to bottom, #3b82f6 50%, #fff 50%)";
              // } else if (idx % 2 === 1 && votes > 0) {
              //   background = "linear-gradient(to bottom, #fff 50%, #3b82f6 50%)";
              // }

              return (
                <div
                  key={idx}
                  className="flex flex-row items-center mb-2"
                  // style={background ? { background } : {}}
                >
                  {/* Time Cell */}
                  <div
                    className="h-10 flex items-center justify-end text-md text-gray-600 font-medium"
                    style={{ minWidth: 48 }}
                  >
                    {time}
                  </div>
                  {/* Heatmap Cell */}
                  <div
                    className={`${getColor(votes)} rounded-md h-10 w-16 flex items-center justify-center transition-colors ml-2`}
                  >
                    {/* {votes > 0 ? votes : ""} */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}