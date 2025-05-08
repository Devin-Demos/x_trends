import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendAnalysis } from '../types';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface TrendChartProps {
  trendData: TrendAnalysis;
  topicName: string;
}

export function TrendChart({ trendData, topicName }: TrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  if (!trendData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{topicName} Trends</CardTitle>
          <CardDescription>No trend data available.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-60">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!trendData.data || !Array.isArray(trendData.data) || trendData.data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{topicName} Trends</CardTitle>
          <CardDescription>No trend data points available. Please try refreshing the data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-60">
            <p className="text-muted-foreground">No data points to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = trendData.data.map(item => ({
    ...item,
    date: format(parseISO(item.timestamp), 'MMM dd'),
    formattedDate: format(parseISO(item.timestamp), 'MMM dd, yyyy')
  }));

  const trendColor = trendData.trend_direction === 'up' ? 'text-green-500' : 'text-red-500';
  const trendIcon = trendData.trend_direction === 'up' ? '↑' : '↓';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{topicName} Trends</CardTitle>
            <CardDescription>Twitter mention trends over the past week</CardDescription>
          </div>
          <Tabs defaultValue="line" className="w-32">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line" onClick={() => setChartType('line')}>Line</TabsTrigger>
              <TabsTrigger value="bar" onClick={() => setChartType('bar')}>Bar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Mentions</p>
            <p className="text-2xl font-bold">{trendData.total_mentions}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Average Daily</p>
            <p className="text-2xl font-bold">{Math.round(trendData.average_mentions)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Peak Mentions</p>
            <p className="text-2xl font-bold">{trendData.max_mentions}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Trend Direction</p>
            <p className={`text-2xl font-bold ${trendColor}`}>
              {trendIcon} {trendData.trend_direction.toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} mentions`, 'Count']}
                  labelFormatter={(label) => {
                    const dataPoint = chartData.find(item => item.date === label);
                    return dataPoint?.formattedDate || label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} mentions`, 'Count']}
                  labelFormatter={(label) => {
                    const dataPoint = chartData.find(item => item.date === label);
                    return dataPoint?.formattedDate || label;
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
