export interface TrendPoint {
  timestamp: string;
  count: number;
}

export interface Opinion {
  id: string;
  text: string;
  sentiment: number; // -1 to 1 scale
  momentum: number; // Positive for gaining, negative for losing momentum
  agreement: number; // Measure of how many people agree with this opinion
  source: 'twitter' | 'news';
  keywords: string[];
  createdAt: string;
  tweetCount?: number; // Number of tweets expressing this opinion
}

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

export interface ApiStatusData {
  remainingRequests: number;
  resetTime: number;
  error?: string;
}

export interface TopicData {
  name: string;
  keywords: string[];
  trendData: TrendPoint[];
  notableTweets?: Tweet[];
  opinions?: Opinion[];
  lastUpdated: string;
  apiStatus: ApiStatusData;
}

export interface SearchFormData {
  topicName: string;
  keywords: string;
  options: {
    startTime?: string;
    endTime?: string;
  };
}    