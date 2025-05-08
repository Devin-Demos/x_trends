import { BloombergArticle } from '../types/bloomberg';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CACHE_FILE_PATH = path.join(process.cwd(), 'bloomberg_articles.json');

export async function fetchBloombergArticles(authorName: string, limit: number = 5): Promise<BloombergArticle[]> {
  try {
    console.log("Fetching Bloomberg articles for author:", authorName);
    
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
        const cachedArticles = JSON.parse(cacheData);
        
        if (cachedArticles.length > 0 && 
            cachedArticles[0].author.toLowerCase() === authorName.toLowerCase()) {
          console.log("Using cached articles");
          return cachedArticles.slice(0, limit);
        }
      }
    } catch (cacheError) {
      console.error("Error reading cache:", cacheError);
    }
    
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'src', 'utils', 'scraper.py');
      
      const fallbackArticles: BloombergArticle[] = [
        {
          id: '1',
          title: 'Bloomberg Article by ' + authorName,
          link: 'https://www.bloomberg.com/authors/AS7Hj1mMCHQ/shirin-ghaffary',
          pubDate: new Date().toISOString(),
          description: 'Recent article from Bloomberg.',
          content: 'Content not available.',
          author: authorName
        }
      ];
      
      if (!fs.existsSync(scriptPath)) {
        console.error("Scraper script not found at:", scriptPath);
        resolve(fallbackArticles);
        return;
      }
      
      const pythonProcess = spawn('python3', [
        scriptPath,
        '--author', authorName,
        '--limit', limit.toString(),
        '--output', CACHE_FILE_PATH
      ]);
      
      let dataString = '';
      let errorString = '';
      
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error('Python script error:', data.toString());
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0 || errorString) {
          console.error(`Python script exited with code ${code}`);
          console.error('Error output:', errorString);
          resolve(fallbackArticles);
          return;
        }
        
        try {
          if (fs.existsSync(CACHE_FILE_PATH)) {
            const outputData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
            const articles = JSON.parse(outputData);
            resolve(articles.slice(0, limit));
          } else {
            console.error("Output file not found after script execution");
            resolve(fallbackArticles);
          }
        } catch (error) {
          console.error("Error parsing script output:", error);
          resolve(fallbackArticles);
        }
      });
    });
      
  } catch (error) {
    console.error("Error fetching Bloomberg articles:", error);
    
    return [{
      id: '1',
      title: 'Bloomberg Article by ' + authorName,
      link: 'https://www.bloomberg.com/authors/AS7Hj1mMCHQ/shirin-ghaffary',
      pubDate: new Date().toISOString(),
      description: 'Recent article from Bloomberg.',
      content: 'Content not available.',
      author: authorName
    }];
  }
}

export function generateSocialPost(article: BloombergArticle): string {
  const maxLength = 280; // X/Twitter character limit
  
  let summary = article.title;
  
  if (article.description && summary.length + 3 + article.description.length <= maxLength - 30) {
    summary += `: ${article.description}`;
  }
  
  if (summary.length > maxLength - 30) {
    summary = summary.substring(0, maxLength - 33) + '...';
  }
  
  summary += ` ${article.link}`;
  
  return summary;
}
