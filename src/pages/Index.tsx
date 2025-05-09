import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TopicData, SearchFormData, TrendPoint, ApiStatusData, Opinion } from '../types';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import TrendChart from '../components/TrendChart';
import TopicHistory from '../components/TopicHistory';
import OpinionMarket from '../components/OpinionMarket';
import { fetchAllPages } from '../utils/twitterApi';
import { toast } from '../components/ui/use-toast';
import { ChartLine, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { groupTweetsIntoOpinions, calculateMomentum, getTopOpinions } from '../utils/sentimentAnalysis';
import { generateMockTweets } from '../utils/mockData';

const Index = () => {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [currentTopic, setCurrentTopic] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatusData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [risingOpinions, setRisingOpinions] = useState<Opinion[]>([]);
  const [fallingOpinions, setFallingOpinions] = useState<Opinion[]>([]);
  
  useEffect(() => {
    if (currentTopic && currentTopic.notableTweets && currentTopic.notableTweets.length > 0) {
      const opinions = groupTweetsIntoOpinions(currentTopic.notableTweets);
      
      const opinionsWithMomentum = calculateMomentum(opinions);
      
      const { rising, falling } = getTopOpinions(opinionsWithMomentum, 10);
      
      setRisingOpinions(rising);
      setFallingOpinions(falling);
      
      setCurrentTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          opinions: opinionsWithMomentum
        };
      });
    } else {
      setRisingOpinions([]);
      setFallingOpinions([]);
    }
  }, [currentTopic?.notableTweets]);

  const handleSearch = async (formData: SearchFormData) => {
    setIsLoading(true);
    setSearchError(null);
    setLoadingProgress(0);
    
    try {
      let keywords = formData.keywords.split(',').map(k => k.trim());
      const aiTechKeywords = ['AI', 'artificial intelligence', 'tech startup', 'technology', 'startup', 'innovation'];
      
      if (!keywords.some(k => aiTechKeywords.some(tk => k.toLowerCase().includes(tk.toLowerCase())))) {
        keywords = [...keywords, ...aiTechKeywords];
      }
      
      // Show initial loading state
      toast({
        title: "Searching tweets",
        description: "Fetching AI & tech startup opinions from the past 24 hours...",
      });
      
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const startTime = oneDayAgo.toISOString();
      
      // Fetch all tweet counts
      const trendData = await fetchAllPages(keywords, {
        startTime: startTime,
        endTime: formData.options.endTime
      });
      
      // Create the topic data
      const topicData: TopicData = {
        name: formData.topicName,
        keywords,
        trendData,
        notableTweets: [], // Will be populated with tweets
        opinions: [], // Will be populated with opinions
        lastUpdated: new Date().toISOString(),
        apiStatus: {
          remainingRequests: 100, // This would come from X API headers in a real implementation
          resetTime: Date.now() + (15 * 60 * 1000) // 15 minutes from now
        }
      };
      
      const mockTweets = generateMockTweets(keywords, 50);
      topicData.notableTweets = mockTweets;
      
      const opinions = groupTweetsIntoOpinions(mockTweets);
      const opinionsWithMomentum = calculateMomentum(opinions);
      topicData.opinions = opinionsWithMomentum;
      
      const { rising, falling } = getTopOpinions(opinionsWithMomentum, 10);
      setRisingOpinions(rising);
      setFallingOpinions(falling);
      
      // Add to topics and set as current
      setTopics(prev => [topicData, ...prev]);
      setCurrentTopic(topicData);
      
      toast({
        title: "Search complete",
        description: `Found opinions about "${formData.topicName}" from the past 24 hours`,
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
              
              <OpinionMarket 
                risingOpinions={risingOpinions}
                fallingOpinions={fallingOpinions}
              />
              
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
