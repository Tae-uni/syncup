
"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { x: 0, y: 0, value: 10 },
  { x: 1, y: 0, value: 30 },
  { x: 2, y: 0, value: 60 },
  { x: 0, y: 1, value: 80 },
  { x: 1, y: 1, value: 20 },
  { x: 2, y: 1, value: 40 },
];

const getColor = (value: number) => {
  if (value < 20) return '#edf8fb';
  if (value < 40) return '#b2e2e2';
  if (value < 60) return '#66c2a4';
  if (value < 80) return '#2ca25f';
  return '#006d2c';
};

const CELL_SIZE = 40;

const CustomRect = (props: any) => {
  const { x, y, payload } = props;
  return (
    <rect
      x={x - CELL_SIZE / 3}
      y={y - CELL_SIZE / 2}
      width={CELL_SIZE}
      height={CELL_SIZE}
      fill={getColor(payload.value)}
      stroke="#fff"
      rx={4}
    />
  );
};

export default function Heatmap() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name="X"
          domain={[-0.5, 2.5]}
          tickCount={4}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Y"
          domain={[-0.5, 1.5]}
          tickCount={3}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter
          name="Heatmap Data"
          data={data}
          shape={<CustomRect />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
