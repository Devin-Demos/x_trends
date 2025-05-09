import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Opinion } from '../types';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, ExternalLink, MessageSquare, Heart, Repeat } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';

interface OpinionStockProps {
  opinion: Opinion;
  isRising: boolean;
}

const OpinionStock: React.FC<OpinionStockProps> = ({ opinion, isRising }) => {
  const momentumFormatted = Math.abs(opinion.momentum).toFixed(0);
  
  const getSentimentColor = () => {
    if (opinion.sentiment > 0.3) return 'text-green-600';
    if (opinion.sentiment < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };
  
  const getSentimentLabel = () => {
    if (opinion.sentiment > 0.3) return 'Positive';
    if (opinion.sentiment < -0.3) return 'Negative';
    return 'Neutral';
  };
  
  const getMomentumIcon = () => {
    if (isRising) {
      return opinion.momentum > 100 ? 
        <TrendingUp className="h-5 w-5 text-green-600" /> : 
        <ArrowUpCircle className="h-5 w-5 text-green-600" />;
    } else {
      return opinion.momentum < -100 ? 
        <TrendingDown className="h-5 w-5 text-red-600" /> : 
        <ArrowDownCircle className="h-5 w-5 text-red-600" />;
    }
  };
  
  const getTwitterSearchUrl = () => {
    const keywordQuery = opinion.keywords.slice(0, 3).join(' OR ');
    return `https://twitter.com/search?q=${encodeURIComponent(keywordQuery)}&src=typed_query&f=live`;
  };
  
  const avgEngagementPerTweet = Math.round(opinion.agreement / (opinion.tweetCount || 1));
  
  // Estimate likes, replies, and retweets based on total engagement
  const estimatedLikes = Math.round(opinion.agreement * 0.6);
  const estimatedReplies = Math.round(opinion.agreement * 0.2);
  const estimatedRetweets = Math.round(opinion.agreement * 0.2);
  
  return (
    <Card className={`mb-2 border-l-4 ${isRising ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {getMomentumIcon()}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRising ? 'Rising' : 'Falling'} momentum</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`font-semibold ${getSentimentColor()}`}>
                      {isRising ? '+' : '-'}{momentumFormatted}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getSentimentLabel()} sentiment with {Math.abs(opinion.momentum)} engagement points</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <span className="text-sm text-muted-foreground">
                engagement
              </span>
            </div>
            <p className="text-sm line-clamp-2 mb-2">{opinion.text}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {opinion.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
            
            {/* Engagement metrics visualization */}
            <div className="mb-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>Likes</span>
                </div>
                <span>{estimatedLikes.toLocaleString()}</span>
              </div>
              <Progress value={60} className="h-1" />
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-blue-500" />
                  <span>Replies</span>
                </div>
                <span>{estimatedReplies.toLocaleString()}</span>
              </div>
              <Progress value={20} className="h-1" />
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Repeat className="h-3 w-3 text-green-500" />
                  <span>Retweets</span>
                </div>
                <span>{estimatedRetweets.toLocaleString()}</span>
              </div>
              <Progress value={20} className="h-1" />
            </div>
            
            <div>
              <a 
                href={getTwitterSearchUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View all {opinion.tweetCount} tweets
              </a>
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-sm text-muted-foreground">
              {new Date(opinion.createdAt).toLocaleDateString()}
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm font-semibold">
                {opinion.tweetCount} tweets
              </div>
              <div className="text-xs text-muted-foreground">
                {avgEngagementPerTweet} avg. engagement
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpinionStock;
