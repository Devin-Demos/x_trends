import React, { useEffect, useState } from 'react';
import { Tweet } from '../types';
import Layout from '../components/Layout';
import NotableTweets from '../components/NotableTweets';
import { findNotableTweets } from '../utils/dataProcessing';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

const GenerativeAI = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const fetchGenerativeAITweets = async () => {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        const keywords = [
          'generative AI', 
          'generativeAI', 
          'ChatGPT', 
          'GPT-4', 
          'DALL-E', 
          'Midjourney', 
          'Stable Diffusion',
          'Gemini AI',
          'Claude AI',
          'Anthropic',
          'text-to-image',
          'AI image generation',
          'AI text generation',
          'LLM',
          'large language model'
        ];

        const response = await axios.post(`${API_BASE_URL}/search`, {
          keywords,
          maxResults: 100, // Get a good number of tweets to find the most popular ones
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.tweets) {
          const notableTweets = findNotableTweets(response.data.tweets, 10);
          setTweets(notableTweets);
        } else {
          setError('No tweets found in the response');
        }
      } catch (error: any) {
        console.error("Error fetching generative AI tweets:", error);
        
        let errorMessage = "An error occurred while fetching generative AI tweets.";
        if (error.response) {
          if (error.response.status === 429) {
            errorMessage = "X API rate limit exceeded. Please try again later.";
          } else if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = "Authentication error with X API. Please check your API key.";
          } else {
            errorMessage = error.response.data?.error || errorMessage;
          }
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setLoadingProgress(100);
      }
    };

    fetchGenerativeAITweets();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <h1 className="text-3xl font-bold text-brand-800">Popular Generative AI Tweets</h1>
          <p className="text-muted-foreground">
            Displaying the most popular tweets about generative AI technologies like ChatGPT, DALL-E, Midjourney, and more.
          </p>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Loading generative AI tweets...</span>
                <span>{loadingProgress}%</span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
            </div>
          ) : (
            tweets.length > 0 ? (
              <NotableTweets tweets={tweets} topicName="Generative AI" />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tweets found. Try again later.</p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GenerativeAI;
