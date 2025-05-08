
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tweet } from '@/types';
import { formatTimestamp } from '@/utils/dataProcessing';

interface NotableTweetsProps {
  tweets: Tweet[];
  topicName: string;
}

const NotableTweets: React.FC<NotableTweetsProps> = ({ tweets, topicName }) => {
  if (!tweets || tweets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800">Notable Tweets</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">No tweets to display yet. Start a search to find notable tweets.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-brand-800">
          Notable Tweets: {topicName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="p-4">
              <div className="flex items-center mb-2">
                <img
                  src={tweet.author.profile_image_url}
                  alt={tweet.author.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{tweet.author.name}</div>
                  <div className="text-sm text-muted-foreground">@{tweet.author.username}</div>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {formatTimestamp(tweet.created_at)}
                </div>
              </div>
              <p className="mb-2">{tweet.text}</p>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-repeat">
                    <path d="m17 2 4 4-4 4"></path>
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
                    <path d="m7 22-4-4 4-4"></path>
                    <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <span>{tweet.public_metrics.retweet_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                  <span>{tweet.public_metrics.like_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"></path>
                  </svg>
                  <span>{tweet.public_metrics.reply_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotableTweets;
