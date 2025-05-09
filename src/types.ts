export interface TrendPoint {
  timestamp: string;
  count: number;
  sentiment?: number;
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

export interface SubstackPost {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    url: string;
  };
  keywords: string[];
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
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
  notablePosts?: SubstackPost[];
  lastUpdated: string;
  apiStatus: ApiStatusData;
  source?: 'twitter' | 'substack';
}

export interface SearchFormData {
  topicName: string;
  keywords: string;
  options: {
    startTime?: string;
    endTime?: string;
    source?: 'twitter' | 'substack';
  };
}

export interface TrendAnalysis {
  overall_trends: {
    top_keywords: string[];
    total_posts: number;
    avg_sentiment: number;
  };
  weekly_trends: {
    week: string;
    post_count: number;
    top_keywords: string[];
    avg_sentiment: number;
  }[];
  emerging_trends: {
    keyword: string;
    trend_score: number;
    total_occurrences: number;
  }[];
  sentiment_shifts: {
    from_week: string;
    to_week: string;
    sentiment_change: number;
    direction: 'positive' | 'negative';
  }[];
  meta: {
    start_time: string;
    end_time: string;
  };
} 