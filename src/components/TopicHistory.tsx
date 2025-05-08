
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, X } from 'lucide-react';
import { TopicData } from '@/types';

interface TopicHistoryProps {
  topics: TopicData[];
  onSelectTopic: (topic: TopicData) => void;
  onRemoveTopic: (topicName: string) => void;
  currentTopic?: string;
}

const TopicHistory: React.FC<TopicHistoryProps> = ({
  topics,
  onSelectTopic,
  onRemoveTopic,
  currentTopic,
}) => {
  if (!topics || topics.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-brand-800">
            <Clock className="inline-block mr-2 h-5 w-5" />
            Topic History
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            Your topic search history will appear here during this session
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-brand-800">
          <Clock className="inline-block mr-2 h-5 w-5" />
          Topic History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.name}
              className={`flex items-center justify-between p-3 rounded-md ${
                currentTopic === topic.name
                  ? 'bg-brand-100 border border-brand-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-grow">
                <h3 className="font-medium">{topic.name}</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {topic.keywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="outline" 
                      className="text-xs bg-white"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTopic(topic)}
                  disabled={currentTopic === topic.name}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTopic(topic.name)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicHistory;
