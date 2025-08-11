const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

export async function searchWeb(query: string, city: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        `${city} ${query}`
      )}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json();
    return data.items.map((item: any) => item.snippet);
  } catch (error) {
    console.error('Web search error:', error);
    // Return mock results as fallback
    return [
      `${city} is implementing smart city initiatives to improve urban life.`,
      `Recent developments in ${city} focus on sustainable infrastructure.`,
      `${city}'s local government is working on digital transformation projects.`,
    ];
  }
}