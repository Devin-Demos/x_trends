export interface Topic {
  name: string;
  keywords: string[];
}

export interface TopicCreate {
  name: string;
  keywords: string[];
}

export interface TopicUpdate {
  name?: string;
  keywords?: string[];
}

export interface TimeSeriesData {
  timestamp: string;
  count: number;
}

export interface TrendAnalysis {
  total_mentions: number;
  average_mentions: number;
  max_mentions: number;
  min_mentions: number;
  trend_direction: "up" | "down";
  data: TimeSeriesData[];
}
