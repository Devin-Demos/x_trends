import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Opinion } from '../types';
import OpinionStock from './OpinionStock';
import { TrendingUp, TrendingDown, HelpCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './ui/popover';

interface OpinionMarketProps {
  risingOpinions: Opinion[];
  fallingOpinions: Opinion[];
}

const OpinionMarket: React.FC<OpinionMarketProps> = ({ risingOpinions, fallingOpinions }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-brand-800">AI &amp; Tech Startup Opinion Market</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-4 w-4 mr-1" />
              Legend
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Opinion Market Legend</h4>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Sentiment Colors</h5>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                    <span>Positive</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></div>
                    <span>Neutral</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                    <span>Negative</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Momentum Indicators</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span>Strong rise</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                    <span>Strong fall</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Moderate rise</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowDownCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span>Moderate fall</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Engagement Score</h5>
                <p className="text-xs text-muted-foreground">
                  Engagement scores combine retweets, likes, replies, and quotes to measure how much attention an opinion is receiving.
                  Higher numbers indicate more engagement.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rising" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rising" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Rising Opinions
            </TabsTrigger>
            <TabsTrigger value="falling" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Falling Opinions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rising" className="mt-4">
            {risingOpinions.length > 0 ? (
              <div className="space-y-2">
                {risingOpinions.map(opinion => (
                  <OpinionStock 
                    key={opinion.id} 
                    opinion={opinion} 
                    isRising={true} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No rising opinions found. Try searching for more tweets.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="falling" className="mt-4">
            {fallingOpinions.length > 0 ? (
              <div className="space-y-2">
                {fallingOpinions.map(opinion => (
                  <OpinionStock 
                    key={opinion.id} 
                    opinion={opinion} 
                    isRising={false} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No falling opinions found. Try searching for more tweets.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OpinionMarket;
