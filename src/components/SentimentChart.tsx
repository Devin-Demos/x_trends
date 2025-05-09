import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendPoint } from '../types';

interface SentimentChartProps {
  data: TrendPoint[];
  topicName: string;
}

const SentimentChart: React.FC<SentimentChartProps> = ({
  data,
  topicName,
}) => {
  if (!data || data.length === 0 || !data[0].sentiment) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-brand-800">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No sentiment data available</p>
        </CardContent>
      </Card>
    );
  }

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

  const tooltipFormatter = (value: number, name: string) => {
    if (name === 'sentiment') {
      let sentiment = 'Neutral';
      if (value > 2) sentiment = 'Very Positive';
      else if (value > 0) sentiment = 'Positive';
      else if (value < -2) sentiment = 'Very Negative';
      else if (value < 0) sentiment = 'Negative';
      
      return [`${value.toFixed(2)} (${sentiment})`, 'Sentiment'];
    }
    return [value, name];
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-brand-800">Sentiment Analysis: {topicName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
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
              <YAxis domain={[-5, 5]} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="sentiment"
                name="Sentiment"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Sentiment scale: -5 (very negative) to +5 (very positive)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
