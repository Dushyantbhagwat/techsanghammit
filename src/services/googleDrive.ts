export interface DriveImage {
  id: string;
  name: string;
  imageUrl: string;
  createdTime: string;
  city: string;
}

// Sample images from the shared folder
export const driveImages: DriveImage[] = [
  {
    id: '1HPc6ZqTHgzYmvh3LGJeqyQ1KTbjtZqOL',
    name: 'Road Hazard',
    imageUrl: 'https://drive.google.com/file/d/1HPc6ZqTHgzYmvh3LGJeqyQ1KTbjtZqOL/view',
    createdTime: new Date().toISOString(),
    city: 'thane'
  },
  // Pune images from yesterday
  {
    id: '1OWRLjCIFmbymQMVEKqAhA26DP2LFXazm',
    name: 'Infrastructure Issue',
    imageUrl: 'https://drive.google.com/file/d/1OWRLjCIFmbymQMVEKqAhA26DP2LFXazm/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1eAjZKUtNAtEHRJPuMt31bZr_g6fgS15P',
    name: 'Safety Concern',
    imageUrl: 'https://drive.google.com/file/d/1eAjZKUtNAtEHRJPuMt31bZr_g6fgS15P/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1SK8kR6qVkIqbfKLIAoHhkL1IIFnC3JCr',
    name: 'Maintenance Required',
    imageUrl: 'https://drive.google.com/file/d/1SK8kR6qVkIqbfKLIAoHhkL1IIFnC3JCr/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1xsvF7SNmqhab35tne0U9mohvFHA12D_E',
    name: 'Structural Issue',
    imageUrl: 'https://drive.google.com/file/d/1xsvF7SNmqhab35tne0U9mohvFHA12D_E/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1mJrkeSU9xcGqiD9tWcoKKzwVQXC5qRkD',
    name: 'Equipment Malfunction',
    imageUrl: 'https://drive.google.com/file/d/1mJrkeSU9xcGqiD9tWcoKKzwVQXC5qRkD/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1R0ubilpenlEiT5RdWHDLLx3UiJmanL0i',
    name: 'Facility Damage',
    imageUrl: 'https://drive.google.com/file/d/1R0ubilpenlEiT5RdWHDLLx3UiJmanL0i/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1M-A_wmAthO8B4fKV1YtC6yV7JkqPPo68',
    name: 'Security Risk',
    imageUrl: 'https://drive.google.com/file/d/1M-A_wmAthO8B4fKV1YtC6yV7JkqPPo68/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1Xr7NwoFgqe_pTHuBRWWH4x2CGKc4sejL',
    name: 'Environmental Hazard',
    imageUrl: 'https://drive.google.com/file/d/1Xr7NwoFgqe_pTHuBRWWH4x2CGKc4sejL/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  },
  {
    id: '1ZSLf-szGL7WSiCa79rIWTYnb09TiLB4q',
    name: 'Access Problem',
    imageUrl: 'https://drive.google.com/file/d/1ZSLf-szGL7WSiCa79rIWTYnb09TiLB4q/view',
    createdTime: new Date(Date.now() - 86400000).toISOString(),
    city: 'pune'
  }
];

// Helper function to convert any Drive URL to sharing URL
export function getDirectImageUrl(url: string): string {
  // Extract file ID from various possible formats
  let fileId = '';
  
  if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0];
  } else if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0];
  }
  
  if (!fileId) return url;
  
  // Return sharing URL format that works with iframe preview
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export async function fetchDriveImages(city?: string): Promise<DriveImage[]> {
  // Filter images by city if provided
  const filteredImages = city 
    ? driveImages.filter(img => img.city === city.toLowerCase())
    : driveImages;

  return Promise.resolve(filteredImages);
}