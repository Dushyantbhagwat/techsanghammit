export interface CityUpdate {
  id: string;
  type: 'NEWS' | 'EVENT' | 'ALERT';
  title: string;
  description: string;
  timestamp: string;
  source?: string;
  url?: string;
}

// Mock data generator for city updates
const generateMockUpdates = (city: string): CityUpdate[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'NEWS',
      title: `${city} Launches Smart Traffic Management System`,
      description: `The city has implemented an AI-powered traffic management system to reduce congestion and improve traffic flow.`,
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      source: 'City Transportation Department'
    },
    {
      id: '2',
      type: 'EVENT',
      title: `Tech Innovation Summit`,
      description: `Join us for the annual Tech Innovation Summit at ${city} Convention Center, featuring discussions on smart city initiatives.`,
      timestamp: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
      url: 'https://example.com/events'
    },
    {
      id: '3',
      type: 'ALERT',
      title: 'Road Maintenance Schedule',
      description: `Scheduled maintenance work on major roads in ${city} central district. Please plan alternate routes.`,
      timestamp: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
      source: 'Public Works Department'
    },
    {
      id: '4',
      type: 'NEWS',
      title: `${city} Achieves Sustainability Milestone`,
      description: 'City reaches 30% renewable energy usage in public infrastructure.',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      source: 'Environmental Affairs'
    },
    {
      id: '5',
      type: 'EVENT',
      title: 'Smart City Hackathon',
      description: `Developers and innovators gather to create solutions for ${city}'s urban challenges.`,
      timestamp: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
      url: 'https://example.com/hackathon'
    }
  ];
};

export async function getCityUpdates(city: string): Promise<CityUpdate[]> {
  try {
    // In a real implementation, this would fetch from an API
    // For now, return mock data
    return generateMockUpdates(city);
  } catch (error) {
    console.error('Error fetching city updates:', error);
    return [];
  }
}

export async function searchCityUpdates(city: string, query: string): Promise<CityUpdate[]> {
  try {
    const updates = await getCityUpdates(city);
    const lowercaseQuery = query.toLowerCase();
    
    return updates.filter(update => 
      update.title.toLowerCase().includes(lowercaseQuery) ||
      update.description.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching city updates:', error);
    return [];
  }
}