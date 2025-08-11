import { getCityUpdates } from './cityUpdates';
import { searchWeb } from './webSearch';

interface CityContext {
  traffic: {
    congestion: string;
    averageSpeed: string;
    vehicleCount: string;
  };
  parking: {
    available: string;
    total: string;
    occupancy: string;
  };
  environment: {
    aqi: string;
    temperature: string;
    humidity: string;
  };
  streetlights: {
    working: string;
    faults: string;
    energy: string;
  };
}

interface CityUpdate {
  type: 'NEWS' | 'EVENT' | 'ALERT';
  title: string;
  description: string;
  timestamp: string;
  source?: string;
  url?: string;
}

// Mock web search results for development
const mockWebSearch = async (query: string, city: string): Promise<string[]> => {
  const results = [
    `${city} is known for its vibrant culture and rapid development.`,
    `Recent infrastructure projects in ${city} include smart traffic management systems.`,
    `${city}'s local government has initiated several smart city initiatives.`,
    `The public transportation system in ${city} is undergoing modernization.`,
  ];
  return results.filter(result => 
    result.toLowerCase().includes(query.toLowerCase()) || 
    Math.random() > 0.5
  );
};

// Get relevant city updates
const getRelevantUpdates = async (city: string, query: string): Promise<CityUpdate[]> => {
  const updates = await getCityUpdates(city);
  return updates.filter(update => 
    update.title.toLowerCase().includes(query.toLowerCase()) ||
    update.description.toLowerCase().includes(query.toLowerCase())
  );
};

// Combine all information sources
export const getCityIntelligence = async (
  message: string,
  city: string,
  context: CityContext
): Promise<string> => {
  try {
    // Get real-time metrics response
    const metricsResponse = getMetricsResponse(message, city, context);
    
    // Get relevant city updates
    const updates = await getRelevantUpdates(city, message);
    
    // Get web search results
    const webResults = await mockWebSearch(message, city);

    // Combine all information
    let response = metricsResponse;

    if (updates.length > 0) {
      response += "\n\nRelevant City Updates:";
      updates.slice(0, 2).forEach(update => {
        response += `\n• ${update.title} - ${update.description}`;
      });
    }

    if (webResults.length > 0) {
      response += "\n\nAdditional Information:";
      webResults.slice(0, 2).forEach(result => {
        response += `\n• ${result}`;
      });
    }

    return response;
  } catch (error) {
    console.error('Error generating city intelligence:', error);
    throw new Error('Failed to gather city information. Please try again.');
  }
};

// Get response based on real-time metrics
const getMetricsResponse = (message: string, city: string, context: CityContext): string => {
  const lowercaseMessage = message.toLowerCase();

  if (lowercaseMessage.includes('traffic')) {
    return `Currently in ${city}, the traffic congestion level is at ${context.traffic.congestion} with an average speed of ${context.traffic.averageSpeed}. There are approximately ${context.traffic.vehicleCount} vehicles in monitored areas. The congestion level indicates ${
      parseInt(context.traffic.congestion) > 60 ? 'heavy traffic conditions' : 'moderate to light traffic conditions'
    }.`;
  }

  if (lowercaseMessage.includes('parking')) {
    return `In ${city}, there are currently ${context.parking.available} parking spaces available out of a total of ${context.parking.total} spaces. The current occupancy rate is ${context.parking.occupancy}. ${
      parseInt(context.parking.occupancy) > 80 ? 'Parking is quite limited at the moment.' : 'There should be sufficient parking available.'
    }`;
  }

  if (lowercaseMessage.includes('environment') || lowercaseMessage.includes('weather') || lowercaseMessage.includes('aqi')) {
    return `The current environmental conditions in ${city} show an Air Quality Index (AQI) of ${context.environment.aqi}, temperature at ${context.environment.temperature}, and humidity at ${context.environment.humidity}. ${
      parseInt(context.environment.aqi) > 150 
        ? 'The air quality is concerning, it\'s recommended to limit outdoor activities.' 
        : 'The air quality is within acceptable ranges.'
    }`;
  }

  if (lowercaseMessage.includes('light') || lowercaseMessage.includes('streetlight')) {
    return `The street lighting system in ${city} is operating at ${context.streetlights.working} efficiency with ${context.streetlights.faults} reported faults. Current energy consumption is ${context.streetlights.energy}. ${
      parseInt(context.streetlights.working.replace('%', '')) > 95 
        ? 'The system is performing well.' 
        : 'Maintenance teams are working on addressing the reported issues.'
    }`;
  }

  if (lowercaseMessage.includes('overall') || lowercaseMessage.includes('summary')) {
    return `Here's a quick overview of ${city}:
- Traffic: ${parseInt(context.traffic.congestion) > 60 ? 'Heavy' : 'Moderate'} congestion at ${context.traffic.congestion}
- Parking: ${context.parking.available} spaces available (${context.parking.occupancy} occupied)
- Environment: AQI ${context.environment.aqi}, ${context.environment.temperature}
- Street Lights: ${context.streetlights.working} operational`;
  }

  return `I can help you with information about ${city}'s traffic conditions, parking availability, environmental metrics, street lighting status, and recent city updates. What specific information would you like to know?`;
};