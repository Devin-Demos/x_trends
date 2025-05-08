import { useState } from 'react';
import { Topic } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, RefreshCw, BarChart2 } from 'lucide-react';

interface TopicListProps {
  topics: Topic[];
  onDelete: (name: string) => void;
  onRefresh: (name: string) => void;
  onViewTrends: (name: string) => void;
  onEdit: (topic: Topic) => void;
}

export function TopicList({ topics, onDelete, onRefresh, onViewTrends, onEdit }: TopicListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleRefresh = async (name: string) => {
    setLoading({ ...loading, [name]: true });
    await onRefresh(name);
    setLoading({ ...loading, [name]: false });
  };

  if (topics.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>No topics defined yet. Create your first topic to get started.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        <CardDescription>Manage your tracked topics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.map((topic) => (
            <div 
              key={topic.name} 
              className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <h3 className="font-medium text-lg">{topic.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {topic.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(topic)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRefresh(topic.name)}
                  disabled={loading[topic.name]}
                >
                  {loading[topic.name] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewTrends(topic.name)}
                >
                  <BarChart2 className="h-4 w-4 mr-1" />
                  View Trends
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(topic.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
