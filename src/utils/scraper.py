import time
import argparse
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import re
import os

def setup_driver():
    """Set up and return a headless Chrome driver."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def search_bloomberg_articles(author_name, limit=5):
    """Search for Bloomberg articles by the specified author using Google."""
    driver = setup_driver()
    
    try:
        search_query = f"site:bloomberg.com {author_name} author"
        url = f"https://www.google.com/search?q={search_query}"
        
        print(f"Searching for: {search_query}")
        driver.get(url)
        time.sleep(2)  # Allow page to load
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        search_results = soup.select('div.g')
        
        print(f"Found {len(search_results)} search results")
        
        articles = []
        for idx, result in enumerate(search_results):
            if idx >= limit:
                break
                
            title_element = result.select_one('h3')
            link_element = result.select_one('a')
            snippet_element = result.select_one('div.VwiC3b')
            
            if title_element and link_element and snippet_element:
                title = title_element.text
                link = link_element.get('href')
                
                if link.startswith('/url?'):
                    match = re.search(r'url=([^&]+)', link)
                    if match:
                        link = match.group(1)
                
                snippet = snippet_element.text
                
                article_id = f"{idx+1}"
                
                date_match = re.search(r'(\d{1,2}\s+\w+\s+\d{4})|(\w+\s+\d{1,2},\s+\d{4})', snippet)
                pub_date = date_match.group(0) if date_match else "2025-05-08T10:30:00Z"  # Default date if not found
                
                print(f"Found article: {title}")
                
                articles.append({
                    "id": article_id,
                    "title": title,
                    "link": link,
                    "pubDate": pub_date,
                    "description": snippet,
                    "content": snippet,
                    "author": author_name
                })
        
        return articles
    
    finally:
        driver.quit()

def save_articles_to_file(articles, filename="bloomberg_articles.json"):
    """Save the articles to a JSON file."""
    with open(filename, 'w') as f:
        json.dump(articles, f, indent=2)
    print(f"Saved {len(articles)} articles to {filename}")

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Scrape Bloomberg articles by author')
    parser.add_argument('--author', type=str, default="Shirin Ghaffary", help='Author name to search for')
    parser.add_argument('--limit', type=int, default=5, help='Maximum number of articles to fetch')
    parser.add_argument('--output', type=str, default="bloomberg_articles.json", help='Output JSON file path')
    
    if len(sys.argv) > 1:
        return parser.parse_args()
    else:
        return argparse.Namespace(author="Shirin Ghaffary", limit=5, output="bloomberg_articles.json")

if __name__ == "__main__":
    args = parse_arguments()
    
    print(f"Searching for articles by {args.author}, limit: {args.limit}")
    
    articles = search_bloomberg_articles(args.author, args.limit)
    
    save_articles_to_file(articles, args.output)
    
    print(f"Found {len(articles)} articles by {args.author}")
    for article in articles:
        print(f"Title: {article['title']}")
        print(f"Link: {article['link']}")
        print(f"Description: {article['description'][:100]}...")
        print("-" * 50)
