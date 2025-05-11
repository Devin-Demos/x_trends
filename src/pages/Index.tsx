import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopicData, SearchFormData, TrendPoint, ApiStatusData } from '@/types';
import Layout from '@/components/Layout';
import SearchForm from '@/components/SearchForm';
import TrendChart from '@/components/TrendChart';
import TopicHistory from '@/components/TopicHistory';
import { fetchAllPages } from '@/utils/twitterApi';
import { toast } from '@/components/ui/use-toast';
import { ChartLine, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [currentTopic, setCurrentTopic] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatusData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleSearch = async (formData: SearchFormData) => {
    setIsLoading(true);
    setSearchError(null);
    setLoadingProgress(0);
    
    try {
      const keywords = formData.keywords.split(',').map(k => k.trim());
      
      // Show initial loading state
      toast({
        title: "Searching tweets",
        description: "Fetching tweet counts from the past 7 days...",
      });
      
      // Fetch all tweet counts
      const trendData = await fetchAllPages(keywords, {
        startTime: formData.options.startTime,
        endTime: formData.options.endTime
      });
      
      // Create the topic data
      const topicData: TopicData = {
        name: formData.topicName,
        keywords,
        trendData,
        lastUpdated: new Date().toISOString(),
        apiStatus: {
          remainingRequests: 100, // This would come from X API headers in a real implementation
          resetTime: Date.now() + (15 * 60 * 1000) // 15 minutes from now
        }
      };
      
      // Add to topics and set as current
      setTopics(prev => [topicData, ...prev]);
      setCurrentTopic(topicData);
      
      toast({
        title: "Search complete",
        description: `Found tweet counts for "${formData.topicName}"`,
      });
    } catch (error: any) {
      console.error("Error searching tweet counts:", error);
      
      let errorMessage = "An error occurred while searching for tweet counts.";
      if (error.response) {
        if (error.response.status === 429) {
          errorMessage = "X API rate limit exceeded. Please try again later.";
          setApiStatus({
            error: errorMessage,
            remainingRequests: 0,
            resetTime: error.response.headers['x-rate-limit-reset']
          });
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "Authentication error with X API. Please check your API key.";
        } else {
          errorMessage = error.response.data?.error || errorMessage;
        }
      }
      
      setSearchError(errorMessage);
      
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleRemoveTopic = (topicName: string) => {
    setTopics(prev => prev.filter(t => t.name !== topicName));
    if (currentTopic?.name === topicName) {
      setCurrentTopic(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          
          {searchError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Loading tweet counts...</span>
                <span>{loadingProgress}%</span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
            </div>
          )}
          
          {currentTopic && (
            <>
              <TrendChart data={currentTopic.trendData} topicName={currentTopic.name} />
              
              <TopicHistory 
                topics={topics} 
                onSelectTopic={setCurrentTopic} 
                onRemoveTopic={handleRemoveTopic}
                currentTopic={currentTopic.name}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
