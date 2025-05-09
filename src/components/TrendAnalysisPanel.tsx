import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendAnalysis } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface TrendAnalysisPanelProps {
  analysis: TrendAnalysis;
}

const TrendAnalysisPanel: React.FC<TrendAnalysisPanelProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-brand-800">Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No trend analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-brand-800">Emerging Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.emerging_trends.slice(0, 5).map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg font-medium">{trend.keyword}</span>
                  <Badge variant="outline" className="ml-2">
                    Score: {trend.trend_score.toFixed(2)}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {trend.total_occurrences} occurrences
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-brand-800">Sentiment Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.sentiment_shifts.length > 0 ? (
              analysis.sentiment_shifts.map((shift, index) => (
                <div key={index} className="border-b pb-2 last:border-0">
                  <div className="flex items-center">
                    {shift.direction === 'positive' ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">
                      {shift.direction === 'positive' ? 'Positive' : 'Negative'} shift
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    From {new Date(shift.from_week).toLocaleDateString()} to{' '}
                    {new Date(shift.to_week).toLocaleDateString()}
                  </div>
                  <div className="text-sm mt-1">
                    Sentiment change: {shift.sentiment_change.toFixed(2)} points
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No significant sentiment shifts detected</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-brand-800">Top Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.overall_trends.top_keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1">
                {keyword}
              </Badge>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">Total Posts</div>
              <div className="text-2xl font-bold">{analysis.overall_trends.total_posts}</div>
            </div>
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">Average Sentiment</div>
              <div className="text-2xl font-bold">
                {analysis.overall_trends.avg_sentiment.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendAnalysisPanel;
