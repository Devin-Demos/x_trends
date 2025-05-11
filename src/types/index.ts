
export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  author: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  };
}

export interface TrendPoint {
  timestamp: string;
  count: number;
}

export interface TopicData {
  name: string;
  keywords: string[];
  trendData: TrendPoint[];
  notableTweets: Tweet[];
  lastUpdated: string;
  apiStatus?: ApiStatusData;
}

export interface ApiStatusData {
  remainingRequests?: number;
  resetTime?: number;
  error?: string;
}

export interface SearchOptions {
  maxResults?: number;
  startTime?: string;
  endTime?: string;
}

export interface SearchFormData {
  topicName: string;
  keywords: string;
  options?: SearchOptions;
}
