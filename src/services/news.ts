import axios from 'axios';
import { localNewsData } from '@/data/localNews';

const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/news';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  pubDate: string;
  imageUrl?: string;
  category: 'TRAFFIC' | 'EVENT' | 'ALERT' | 'GENERAL';
  source: string;
  link: string;
}

interface NewsDataArticle {
  title: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url?: string;
  category: string[];
  source_id: string;
  link: string;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export const newsService = {
  async getCityNews(city: string, category?: string): Promise<NewsArticle[]> {
    try {
      // Get local news for this city
      const localNews = localNewsData[city.toLowerCase()] || [];
      
      // Filter by category if specified
      if (category && category !== 'ALL') {
        return localNews.filter(article => article.category === category);
      }

      return localNews;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },

  async getLatestNews(city: string): Promise<NewsArticle[]> {
    const allNews = await this.getCityNews(city);
    return allNews.slice(0, 10);
  },

  // This method can be used later when we want to fetch external news
  async getExternalNews(city: string): Promise<NewsArticle[]> {
    try {
      const response = await axios.get<NewsDataResponse>(BASE_URL, {
        params: {
          apikey: API_KEY,
          q: `${city} "Navi Mumbai" Maharashtra`,
          language: 'en',
          country: 'in'
        }
      });

      if (response.data.status !== 'success') {
        throw new Error('Failed to fetch news');
      }

      return response.data.results.map(article => ({
        id: Buffer.from(article.link).toString('base64'),
        title: article.title,
        description: article.description || '',
        content: article.content || '',
        pubDate: article.pubDate,
        imageUrl: article.image_url,
        category: categorizeArticle(
          article.category || [], 
          article.title, 
          article.content || ''
        ),
        source: article.source_id,
        link: article.link
      }));
    } catch (error) {
      console.error('Error fetching external news:', error);
      return [];
    }
  }
};

const categorizeArticle = (categories: string[], title: string, content: string): NewsArticle['category'] => {
  // Check for traffic related news
  const trafficKeywords = ['traffic', 'road', 'highway', 'metro', 'transport', 'accident', 'construction'];
  if (
    categories.includes('traffic') ||
    trafficKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || 
      content.toLowerCase().includes(keyword)
    )
  ) {
    return 'TRAFFIC';
  }

  // Check for events
  const eventKeywords = ['event', 'festival', 'celebration', 'concert', 'exhibition', 'fair'];
  if (
    categories.includes('entertainment') ||
    eventKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || 
      content.toLowerCase().includes(keyword)
    )
  ) {
    return 'EVENT';
  }

  // Check for alerts
  const alertKeywords = ['warning', 'alert', 'emergency', 'danger', 'caution', 'safety'];
  if (
    categories.includes('politics') ||
    alertKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || 
      content.toLowerCase().includes(keyword)
    )
  ) {
    return 'ALERT';
  }

  return 'GENERAL';
};