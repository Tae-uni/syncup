"use client";

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

  // Get legend label by color
  const getLegendLabelByColor = (color: string): string => {
    switch (color) {
      case 'bg-gray-100': return 'Not Voted';
      case 'bg-blue-100': return '1-20%';
      case 'bg-blue-200': return '21-40%';
      case 'bg-blue-300': return '41-60%';
      case 'bg-blue-400': return '61-80%';
      case 'bg-blue-500': return '81-100%';
      default: return '';
    }
  };

  const getColorDistribution = () => {
    const colorSet = new Set<string>();

    voteData.forEach((votes) => {
      const color = getColor(votes);
      colorSet.add(color);
    });

    // Always include gray block
    colorSet.add('bg-gray-100');

    const colors = Array.from(colorSet).sort((a, b) => {
      const order = ['bg-gray-100', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500'];
      return order.indexOf(a) - order.indexOf(b);
    });

    return colors.map(color => ({
      color,
      widthPercent: 100 / colors.length,
      label: getLegendLabelByColor(color),
    }))
  };

  // Max votes
  const maxVotes = Math.max(...Array.from(voteData.values()), 0);

  return (
    <div className="mt-8 space-y-2">
      <div className="mt-6">
        <div className="text-center font-bold text-lg mb-2">Detailed Availability</div>
        <div className="flex justify-center items-center space-x-2">
          <div className="py-1 text-xs">
            0/{totalParticipants} Available
          </div>
          <div className="w-48 h-6 flex rounded overflow-hidden border border-gray-300">
            {getColorDistribution().map((item, idx) => (
              <div 
                key={idx} 
                className={`${item.color} h-full relative hover:brightness-95 transition-all`} 
                style={{ width: `${item.widthPercent}%` }}
                title={item.label}
              >
              </div>
            ))}
          </div>
          <div className="py-1 text-xs">
            {maxVotes}/{totalParticipants} Available
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-1 mb-3">
          Hover over cells to see detailed availability
        </div>
        <hr />
      </div>
      <div className="flex justify-center items-center">
        {/* Empty cell */}
        <div className="w-12 mr-2"></div>

        {/* Date headers */}
        {formatDates.map((date, i) => (
          <div key={i} className="w-14 text-center mx-1 mt-2">
            <div className="text-xs text-gray-600">{date.monthDay}</div>
            <div className="font-semibold text-lg">{date.weekday}</div>
          </div>
        ))}
      </div>

      {/* Time and heatmap row */}
      <div>
        {timeBlocks.map((time, timeIdx) => (
          <div key={timeIdx} className="flex justify-center items-center mb-1">
            {/* Time label */}
            <div
              className="w-12 text-sm text-gray-600 text-right mr-2"
            >
              {time}
            </div>

            {/* Each date's heatmap cell */}
            {formatDates.map((date, dateIdx) => {
              const key = `${date.original}_${time}`;
              const votes = voteData.get(key) || 0;

              return (
                <div
                  key={dateIdx}
                  className={`${getColor(votes)} border border-gray-300 h-7 w-14 mx-1 flex items-center justify-center rounded-md hover:brightness-95 transition-all`}
                  title={`${votes}/${totalParticipants} available at ${time} on ${date.monthDay}`}
                >
                  {votes > 0 && votes >= totalParticipants * 0.7 && (
                    <span className="text-xs font-medium text-gray-200">
                      {votes}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}