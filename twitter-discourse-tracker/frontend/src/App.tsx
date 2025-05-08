import { useState, useEffect } from 'react'
import './App.css'
import { TopicForm } from './components/TopicForm'
import { TopicList } from './components/TopicList'
import { TrendChart } from './components/TrendChart'
import { Topic, TopicCreate, TopicUpdate, TrendAnalysis } from './types'
import { getTopics, createTopic, updateTopic, deleteTopic, refreshTopicData, getTopicTrends, getApiStatus } from './api/topics'

function App() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null)
  const [isEditing, setIsEditing] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [twitterApiEnabled, setTwitterApiEnabled] = useState(false)

  useEffect(() => {
    fetchTopics()
    fetchApiStatus()
  }, [])
  
  const fetchApiStatus = async () => {
    try {
      const status = await getApiStatus()
      setTwitterApiEnabled(status.twitter_api_enabled)
    } catch (err) {
      console.error('Failed to fetch API status:', err)
      setTwitterApiEnabled(false)
    }
  }

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const data = await getTopics()
      setTopics(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch topics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTopic = async (topic: TopicCreate) => {
    try {
      await createTopic(topic)
      await fetchTopics()
      
      await refreshTopicData(topic.name)
      fetchTrendData(topic.name)
    } catch (err) {
      setError('Failed to create topic')
      console.error(err)
    }
  }

  const handleUpdateTopic = async (topic: TopicCreate) => {
    if (!isEditing) return

    try {
      const update: TopicUpdate = {
        name: topic.name !== isEditing.name ? topic.name : undefined,
        keywords: topic.keywords
      }
      await updateTopic(isEditing.name, update)
      fetchTopics()
      setIsEditing(null)
    } catch (err) {
      setError('Failed to update topic')
      console.error(err)
    }
  }

  const handleDeleteTopic = async (name: string) => {
    try {
      await deleteTopic(name)
      fetchTopics()
      if (selectedTopic === name) {
        setSelectedTopic(null)
        setTrendData(null)
      }
    } catch (err) {
      setError('Failed to delete topic')
      console.error(err)
    }
  }

  const handleRefreshData = async (name: string) => {
    try {
      await refreshTopicData(name)
      if (selectedTopic === name) {
        fetchTrendData(name)
      }
    } catch (err) {
      setError('Failed to refresh data')
      console.error(err)
    }
  }

  const fetchTrendData = async (name: string) => {
    try {
      const data = await getTopicTrends(name)
      setTrendData(data)
      setSelectedTopic(name)
      setError(null)
    } catch (err) {
      setError('Failed to fetch trend data')
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Twitter Discourse Tracker</h1>
        <p className="text-center text-gray-600 mb-6">Monitor trending topics and keywords on Twitter</p>
        <div className="flex justify-center">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${twitterApiEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {twitterApiEnabled ? 'Using Real Twitter Data' : 'Using Mock Data'}
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {isEditing ? (
            <TopicForm 
              onSubmit={handleUpdateTopic} 
              initialTopic={isEditing} 
              buttonText="Update Topic"
            />
          ) : (
            <TopicForm onSubmit={handleCreateTopic} />
          )}
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading topics...</p>
            </div>
          ) : (
            <TopicList 
              topics={topics} 
              onDelete={handleDeleteTopic} 
              onRefresh={handleRefreshData} 
              onViewTrends={fetchTrendData}
              onEdit={(topic) => setIsEditing(topic)}
            />
          )}
        </div>
      </div>

      {selectedTopic && trendData && (
        <div className="mt-8">
          <TrendChart trendData={trendData} topicName={selectedTopic} />
        </div>
      )}

      {isEditing && (
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={() => setIsEditing(null)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel Editing
          </button>
        </div>
      )}
    </div>
  )
}

export default App
