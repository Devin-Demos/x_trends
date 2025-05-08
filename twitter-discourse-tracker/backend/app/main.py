from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from pydantic import BaseModel
from typing import List, Dict, Optional
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import json
import random

load_dotenv()

TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "")

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

topics_db = {}
topic_data_db = {}

class Topic(BaseModel):
    name: str
    keywords: List[str]

class TopicCreate(BaseModel):
    name: str
    keywords: List[str]

class TopicUpdate(BaseModel):
    name: Optional[str] = None
    keywords: Optional[List[str]] = None

class TimeSeriesData(BaseModel):
    timestamp: str
    count: int

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api-status")
async def api_status():
    """Check if Twitter API is configured"""
    return {"twitter_api_enabled": bool(TWITTER_BEARER_TOKEN)}

@app.get("/topics", response_model=List[Topic])
async def get_topics():
    """Get all tracked topics"""
    return [Topic(name=name, keywords=data["keywords"]) for name, data in topics_db.items()]

@app.post("/topics", response_model=Topic)
async def create_topic(topic: TopicCreate):
    """Create a new topic to track"""
    if topic.name in topics_db:
        return {"error": "Topic already exists"}
    
    topics_db[topic.name] = {
        "keywords": topic.keywords,
        "created_at": datetime.now().isoformat()
    }
    topic_data_db[topic.name] = []
    
    return Topic(name=topic.name, keywords=topic.keywords)

@app.get("/topics/{topic_name}", response_model=Topic)
async def get_topic(topic_name: str):
    """Get a specific topic"""
    if topic_name not in topics_db:
        return {"error": "Topic not found"}
    
    return Topic(name=topic_name, keywords=topics_db[topic_name]["keywords"])

@app.put("/topics/{topic_name}", response_model=Topic)
async def update_topic(topic_name: str, topic_update: TopicUpdate):
    """Update a topic"""
    if topic_name not in topics_db:
        return {"error": "Topic not found"}
    
    if topic_update.name:
        new_name = topic_update.name
        topics_db[new_name] = topics_db[topic_name].copy()
        topic_data_db[new_name] = topic_data_db[topic_name].copy()
        
        del topics_db[topic_name]
        del topic_data_db[topic_name]
        
        topic_name = new_name
    
    if topic_update.keywords:
        topics_db[topic_name]["keywords"] = topic_update.keywords
    
    return Topic(name=topic_name, keywords=topics_db[topic_name]["keywords"])

@app.delete("/topics/{topic_name}")
async def delete_topic(topic_name: str):
    """Delete a topic"""
    if topic_name not in topics_db:
        return {"error": "Topic not found"}
    
    del topics_db[topic_name]
    del topic_data_db[topic_name]
    
    return {"message": f"Topic '{topic_name}' deleted successfully"}

@app.get("/topics/{topic_name}/data")
async def get_topic_data(topic_name: str, days: int = 7):
    """Get time series data for a topic"""
    if topic_name not in topics_db:
        return {"error": "Topic not found"}
    
    return topic_data_db.get(topic_name, [])

@app.post("/topics/{topic_name}/refresh")
async def refresh_topic_data(topic_name: str):
    """Refresh data for a specific topic by querying Twitter API"""
    if topic_name not in topics_db:
        return {"error": "Topic not found"}
    
    keywords = topics_db[topic_name]["keywords"]
    
    if not TWITTER_BEARER_TOKEN:
        mock_data = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        current_date = start_date
        
        while current_date <= end_date:
            count = random.randint(10, 100)
            
            mock_data.append({
                "timestamp": current_date.isoformat(),
                "count": count
            })
            
            current_date += timedelta(days=1)
        
        topic_data_db[topic_name] = mock_data
        
        return mock_data
    
    try:
        query = " OR ".join(keywords)
        
        headers = {
            "Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"
        }
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        url = "https://api.twitter.com/2/tweets/counts/recent"
        
        params = {
            "query": query,
            "granularity": "day",
            "start_time": start_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_time": end_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            twitter_data = response.json()
            
            formatted_data = []
            for data_point in twitter_data.get("data", []):
                formatted_data.append({
                    "timestamp": data_point.get("end", ""),
                    "count": data_point.get("tweet_count", 0)
                })
            
            topic_data_db[topic_name] = formatted_data
            
            return formatted_data
        elif response.status_code == 429:
            return {"error": "Twitter API rate limit exceeded, please try again later"}
        else:
            return {"error": f"Twitter API error: {response.status_code} - {response.text}"}
    except Exception as e:
        print(f"Error fetching Twitter data: {str(e)}")
        return {"error": f"Error fetching Twitter data: {str(e)}"}

@app.get("/topics/{topic_name}/trends")
async def get_topic_trends(topic_name: str):
    """Get trend analysis for a topic"""
    if topic_name not in topics_db:
        return {"error": "Topic not found"}
    
    data = topic_data_db.get(topic_name, [])
    
    if not data:
        return {"error": "No data available for trend analysis"}
    
    counts = [item["count"] for item in data]
    
    trend_analysis = {
        "total_mentions": sum(counts),
        "average_mentions": sum(counts) / len(counts) if counts else 0,
        "max_mentions": max(counts) if counts else 0,
        "min_mentions": min(counts) if counts else 0,
        "trend_direction": "up" if len(counts) > 1 and counts[-1] > counts[0] else "down",
        "data": data
    }
    
    return trend_analysis
