import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Opinion } from '../types';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from './ui/badge';

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
  
  return (
    <Card className={`mb-2 border-l-4 ${isRising ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getMomentumIcon()}
              <span className={`font-semibold ${getSentimentColor()}`}>
                {isRising ? '+' : '-'}{momentumFormatted}
              </span>
              <span className="text-sm text-muted-foreground">
                engagement
              </span>
            </div>
            <p className="text-sm line-clamp-2 mb-2">{opinion.text}</p>
            <div className="flex flex-wrap gap-1">
              {opinion.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
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
