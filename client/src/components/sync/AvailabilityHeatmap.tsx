import { Scatter, ScatterProps, Tooltip, XAxis, YAxis, ZAxis, ScatterChart, CartesianGrid } from "recharts";
import { parse, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

// const colorScale = (value: number) => {
//   const max = 0.2 + (value / 10) * 0.8;
//   return `rgba(100, 108, 255, ${max})`;
// };

const colorScale = (value: number, totalParticipants: number) => {
  const percentage = totalParticipants > 0 ? value / totalParticipants : 0;
  return `rgba(100, 150, 255, ${0.2 + percentage * 0.8})`;
};

export default function AvailabilityHeatmap({
  data, dates, timeBlocks, totalParticipants = 3
}: {
  data: { x: number, y: number, value: number, date: string, time: string }[];
  dates: string[];
  timeBlocks: string[];
  totalParticipants?: number;
}) {
  // Format dates to display in the heatmap
  const formatDates = dates.map(date => {
    const dateObj = parse(date, 'yyyy-MM-dd', new Date());
    const monthDay = format(dateObj, 'MMM d', { locale: enUS });
    const weekday = format(dateObj, 'EEE', { locale: enUS });
    return { monthDay, weekday, original: date };
  });

  return (
    <ScatterChart
      width={800}
      height={500}
      margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> */}
      <XAxis
        type="category"
        dataKey="date"
        domain={[0, dates.length - 1]}
        name="Date"
        tickFormatter={idx => ""}
        ticks={dates.map((_, i) => i)}
        interval={0}
      />
      <YAxis
        type="number"
        dataKey="y"
        name="Time"
        domain={[0, timeBlocks.length - 1]}
        tickFormatter={idx => timeBlocks[idx]}
        ticks={timeBlocks.map((_, i) => i)}
        interval={0}
        tick={{ fontSize: 12 }}
      />
      <ZAxis type="number" dataKey="value" name="Votes" range={[0, 100]} />
      <Tooltip
        cursor={{ strokeDasharray: '3 3' }}
        formatter={(_, __, { payload }) =>
          `${dates[payload.x]}, ${timeBlocks[payload.y]}: ${payload.value} votes`
        }
      />
      <Scatter
        data={data}
        shape={(props: ScatterProps) => {
          const { value = 0, x, y } = props as any;
          return (
            <rect
              x={x - 45}
              y={y - 15}
              width={90}
              height={30}
              fill={colorScale(value, totalParticipants)}
              style={{
                fillOpacity: 0.8,
                stroke: value > 0 ? '#8884d8' : '#f0f0f0',
                strokeWidth: 1,
              }}
              rx={3}
              ry={3}
            />
          );
        }}
      />
    </ScatterChart>
  );
}