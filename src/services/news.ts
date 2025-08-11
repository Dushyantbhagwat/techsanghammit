const API_KEY = '55f65c14a843482e9614d78048bcaf73';
const BASE_URL = 'https://newsapi.org/v2/everything';

export interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export const getNews = async (city: string, category: string): Promise<Article[]> => {
  try {
    const query = category === 'all' ? `"${city}"` : `"${city}" AND "${category}"`;
    const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};