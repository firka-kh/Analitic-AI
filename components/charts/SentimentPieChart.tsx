
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SentimentData } from '../../types';

interface SentimentPieChartProps {
  data: SentimentData;
}

const COLORS = {
  positive: '#22c55e', // green-500
  neutral: '#64748b', // slate-500
  negative: '#ef4444', // red-500
};

const LABELS = {
  positive: 'Позитив',
  neutral: 'Нейтрально',
  negative: 'Негатив',
};

const SentimentPieChart: React.FC<SentimentPieChartProps> = ({ data }) => {
  const chartData = [
    { name: LABELS.positive, value: data.positive },
    { name: LABELS.neutral, value: data.neutral },
    { name: LABELS.negative, value: data.negative },
  ].filter(d => d.value > 0);

  const chartColors = [
      COLORS.positive,
      COLORS.neutral,
      COLORS.negative,
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[Object.values(LABELS).indexOf(entry.name)]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SentimentPieChart;
