import { NewsArticle } from '@/services/news';

export const localNewsData: Record<string, NewsArticle[]> = {
  'panvel': [
    {
      id: 'panvel-1',
      title: 'New Metro Station Construction Progress in Panvel',
      description: 'The construction of the new metro station in Panvel is progressing rapidly, with completion expected by end of 2025.',
      content: 'The metro station construction in Panvel has reached 60% completion. This development will significantly improve connectivity to Mumbai and Navi Mumbai.',
      pubDate: new Date().toISOString(),
      category: 'TRAFFIC',
      source: 'Local Updates',
      link: '#',
      imageUrl: 'https://www.metrorailnews.in/wp-content/uploads/2020/12/Navi-Mumbai-Metro.jpg'
    },
    {
      id: 'panvel-2',
      title: 'Panvel Municipal Corporation Announces New Market Complex',
      description: 'A new market complex is being developed near Panvel station to accommodate local vendors and reduce traffic congestion.',
      content: 'The new market complex will house over 200 shops and include parking facilities for 500 vehicles.',
      pubDate: new Date().toISOString(),
      category: 'EVENT',
      source: 'PMC Updates',
      link: '#'
    },
    {
      id: 'panvel-3',
      title: 'Traffic Advisory: Road Repairs on Old Panvel Highway',
      description: 'Major road repairs scheduled on Old Panvel Highway. Commuters advised to take alternative routes.',
      content: 'Road repairs will be carried out from 10 PM to 6 AM to minimize traffic disruption. Work expected to continue for one week.',
      pubDate: new Date().toISOString(),
      category: 'ALERT',
      source: 'Traffic Police',
      link: '#'
    }
  ],
  'kharghar': [
    {
      id: 'kharghar-1',
      title: 'Central Park Enhancement Project in Kharghar',
      description: 'CIDCO announces major enhancement project for Kharghar Central Park with new facilities and landscaping.',
      content: 'The project includes new jogging tracks, open gym equipment, and improved lighting systems.',
      pubDate: new Date().toISOString(),
      category: 'EVENT',
      source: 'CIDCO News',
      link: '#',
      imageUrl: 'https://www.holidify.com/images/cmsuploads/compressed/Central_Park_Kharghar_20190326140055.jpg'
    },
    {
      id: 'kharghar-2',
      title: 'Smart Traffic Management System Implementation',
      description: 'New smart traffic signals being installed at major junctions in Kharghar to reduce congestion.',
      content: 'The AI-powered traffic management system will adjust signal timings based on real-time traffic conditions.',
      pubDate: new Date().toISOString(),
      category: 'TRAFFIC',
      source: 'Smart City Initiative',
      link: '#'
    },
    {
      id: 'kharghar-3',
      title: 'Weather Alert: Heavy Rainfall Warning for Kharghar',
      description: 'Meteorological department issues heavy rainfall warning for Kharghar and surrounding areas.',
      content: 'Residents advised to take necessary precautions and avoid non-essential travel during heavy rainfall.',
      pubDate: new Date().toISOString(),
      category: 'ALERT',
      source: 'Weather Department',
      link: '#'
    }
  ],
  'thane': [
    {
      id: 'thane-1',
      title: 'Thane Station Modernization Project Begins',
      description: 'Railways initiates comprehensive modernization of Thane station with new amenities.',
      content: 'The project includes platform expansion, new foot over bridges, and improved passenger facilities.',
      pubDate: new Date().toISOString(),
      category: 'TRAFFIC',
      source: 'Railway Updates',
      link: '#'
    },
    {
      id: 'thane-2',
      title: 'Cultural Festival at Thane Creek',
      description: 'Three-day cultural festival celebrating local art and cuisine at Thane Creek.',
      content: 'The festival will showcase local artists, food stalls, and cultural performances.',
      pubDate: new Date().toISOString(),
      category: 'EVENT',
      source: 'Cultural Department',
      link: '#',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Thane_Creek_Flamingo_Sanctuary_Mumbai_Maharashtra_India.jpg/1200px-Thane_Creek_Flamingo_Sanctuary_Mumbai_Maharashtra_India.jpg'
    }
  ],
  'borivali': [
    {
      id: 'borivali-1',
      title: 'Sanjay Gandhi National Park Opens New Trail',
      description: 'New hiking trail opened in SGNP for nature enthusiasts and morning walkers.',
      content: 'The 3km trail offers scenic views and is suitable for all age groups.',
      pubDate: new Date().toISOString(),
      category: 'EVENT',
      source: 'SGNP Updates',
      link: '#',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Sanjay_Gandhi_National_Park_Mumbai.jpg/1200px-Sanjay_Gandhi_National_Park_Mumbai.jpg'
    },
    {
      id: 'borivali-2',
      title: 'Traffic Alert: Western Express Highway Repairs',
      description: 'Maintenance work on Western Express Highway near Borivali causes traffic diversions.',
      content: 'Traffic police advise using SV Road as an alternative route during peak hours.',
      pubDate: new Date().toISOString(),
      category: 'TRAFFIC',
      source: 'Traffic Control',
      link: '#'
    }
  ],
  'nashik': [
    {
      id: 'nashik-1',
      title: 'Nashik Smart City Project Update',
      description: 'Smart city initiatives making progress with new digital infrastructure.',
      content: 'Implementation of smart traffic signals and surveillance systems nearing completion.',
      pubDate: new Date().toISOString(),
      category: 'TRAFFIC',
      source: 'Smart City Office',
      link: '#'
    },
    {
      id: 'nashik-2',
      title: 'Wine Festival Announcement',
      description: 'Annual Nashik Wine Festival dates announced, featuring local vineyards.',
      content: 'The festival will showcase wines from over 30 local vineyards with food pairings.',
      pubDate: new Date().toISOString(),
      category: 'EVENT',
      source: 'Tourism Board',
      link: '#',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Sula_Vineyards_Nashik.jpg/1200px-Sula_Vineyards_Nashik.jpg'
    }
  ]
};