import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendPoint } from '@/types';
import { Button } from '@/components/ui/button';

interface TrendChartProps {
  data: TrendPoint[];
  topicName: string;
  chartType?: 'line' | 'bar';
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  topicName,
  chartType: chartTypeProp = 'line',
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>(chartTypeProp);

  if (!data || data.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-brand-800">Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Search for a topic to see trend data</p>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display: only show date label at first hour of each day, otherwise show nothing
  let lastDate = '';
  const formattedData = data.map(point => {
    const dateObj = new Date(point.timestamp);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let label = '';
    if (dateStr !== lastDate) {
      label = dateStr;
      lastDate = dateStr;
    } else {
      label = '';
    }
    return {
      ...point,
      formattedLabel: label
    };
  });

  // Custom XAxis tick to only show date once per day, otherwise show hour
  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-brand-800">Trend Analysis: {topicName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            className="mr-2"
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Bar
          </Button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={formattedData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedLabel" tick={<CustomTick />} interval={0} minTickGap={0} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} tweets`, 'Count']}
                  labelFormatter={(label: string) => `Time: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Tweet Count"
                  stroke="#457B9D"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={formattedData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedLabel" tick={<CustomTick />} interval={0} minTickGap={0} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} tweets`, 'Count']}
                  labelFormatter={(label: string) => `Time: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Tweet Count"
                  fill="#457B9D"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;
