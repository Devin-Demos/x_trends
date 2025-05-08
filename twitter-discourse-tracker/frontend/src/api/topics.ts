import { Topic, TopicCreate, TopicUpdate, TrendAnalysis } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getApiStatus = async (): Promise<{ twitter_api_enabled: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/api-status`);
    if (!response.ok) {
      throw new Error('Failed to get API status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching API status:', error);
    return { twitter_api_enabled: false };
  }
};

export const getTopics = async (): Promise<Topic[]> => {
  const response = await fetch(`${API_URL}/topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }
  return response.json();
};

export const createTopic = async (topic: TopicCreate): Promise<Topic> => {
  const response = await fetch(`${API_URL}/topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(topic),
  });
  if (!response.ok) {
    throw new Error('Failed to create topic');
  }
  return response.json();
};

export const updateTopic = async (name: string, update: TopicUpdate): Promise<Topic> => {
  const response = await fetch(`${API_URL}/topics/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    throw new Error('Failed to update topic');
  }
  return response.json();
};

export const deleteTopic = async (name: string): Promise<void> => {
  const response = await fetch(`${API_URL}/topics/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete topic');
  }
};

export const refreshTopicData = async (name: string): Promise<any> => {
  const response = await fetch(`${API_URL}/topics/${encodeURIComponent(name)}/refresh`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error || `Failed to refresh topic data: ${response.status}`;
    console.error(`API error: ${errorMessage}`);
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const getTopicTrends = async (name: string): Promise<TrendAnalysis> => {
  const response = await fetch(`${API_URL}/topics/${encodeURIComponent(name)}/trends`);
  
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error || `Failed to fetch topic trends: ${response.status}`;
    console.error(`API error: ${errorMessage}`);
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  
  if (data.error) {
    console.error(`API returned error: ${data.error}`);
    throw new Error(data.error);
  }
  
  return data;
};
