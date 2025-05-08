
import { Tweet, TrendPoint } from '../types';

export function processTweetData(tweets: Tweet[]): TrendPoint[] {
  // Sort tweets by creation date
  const sortedTweets = [...tweets].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Group tweets by day
  const tweetsByDay = new Map<string, number>();

  sortedTweets.forEach(tweet => {
    const date = new Date(tweet.created_at);
    const dayKey = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    if (tweetsByDay.has(dayKey)) {
      tweetsByDay.set(dayKey, tweetsByDay.get(dayKey)! + 1);
    } else {
      tweetsByDay.set(dayKey, 1);
    }
  });

  // Convert to trend points array
  const trendPoints: TrendPoint[] = Array.from(tweetsByDay.entries()).map(
    ([timestamp, count]) => ({
      timestamp,
      count
    })
  );

  return trendPoints;
}

export function findNotableTweets(tweets: Tweet[], count: number = 5): Tweet[] {
  // Sort tweets by engagement (using a simple sum of metrics)
  const sortedTweets = [...tweets].sort((a, b) => {
    const engagementA = 
      a.public_metrics.like_count + 
      a.public_metrics.retweet_count * 2 + 
      a.public_metrics.quote_count * 1.5 + 
      a.public_metrics.reply_count;
      
    const engagementB = 
      b.public_metrics.like_count + 
      b.public_metrics.retweet_count * 2 + 
      b.public_metrics.quote_count * 1.5 + 
      b.public_metrics.reply_count;
      
    return engagementB - engagementA;
  });

  // Return top N tweets
  return sortedTweets.slice(0, count);
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
