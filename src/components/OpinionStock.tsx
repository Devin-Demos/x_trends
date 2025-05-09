import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Opinion } from '../types';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
    const searchQuery = encodeURIComponent(`"${opinion.text.substring(0, 100)}"`);
    return `https://twitter.com/search?q=${searchQuery}&src=typed_query&f=live`;
  };
  
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
            <div>
              <a 
                href={getTwitterSearchUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View related tweets
              </a>
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-sm text-muted-foreground">
              {new Date(opinion.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm">
              {opinion.tweetCount} tweets
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpinionStock;
