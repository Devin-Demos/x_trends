import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Opinion } from '../types';
import OpinionStock from './OpinionStock';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface OpinionMarketProps {
  risingOpinions: Opinion[];
  fallingOpinions: Opinion[];
}

const OpinionMarket: React.FC<OpinionMarketProps> = ({ risingOpinions, fallingOpinions }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-brand-800">AI &amp; Tech Startup Opinion Market</CardTitle>
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
