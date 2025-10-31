
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartData {
    name: string;
    [key: string]: string | number;
}

interface QuantitativeBarChartProps {
  data: BarChartData[];
  dataKey: string;
  title: string;
}

const QuantitativeBarChart: React.FC<QuantitativeBarChartProps> = ({ data, dataKey, title }) => {
  return (
    <div className="h-80">
      <h4 className="text-md font-medium text-secondary-700 mb-4 text-center">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#3b82f6" name="Ответы" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuantitativeBarChart;
