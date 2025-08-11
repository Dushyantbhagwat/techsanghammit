import { BusinessPromotion } from '@/types/business';

export const staticPromotions: BusinessPromotion[] = [
  {
    id: '1',
    businessName: 'City Mall',
    description: 'Grand Opening Sale - Up to 50% off on all items',
    category: 'Retail',
    promotionType: 'NEW_OPENING',
    startDate: '2025-03-27',
    endDate: '2025-04-27',
    address: '123 Main Street, Thane',
    contactInfo: {
      phone: '+91 98765 43210',
      email: 'info@citymall.com',
      website: 'www.citymall.com'
    },
    city: 'thane',
    featured: true,
    created_at: '2025-03-27T00:00:00Z'
  },
  {
    id: '2',
    businessName: 'Tech Hub',
    description: 'Special discounts on all electronics',
    category: 'Electronics',
    promotionType: 'DISCOUNT',
    startDate: '2025-03-27',
    endDate: '2025-04-15',
    address: '456 Tech Park, Borivali',
    contactInfo: {
      phone: '+91 98765 43211',
      email: 'sales@techhub.com'
    },
    city: 'borivali',
    featured: false,
    created_at: '2025-03-27T00:00:00Z'
  },
  {
    id: '3',
    businessName: 'Food Festival',
    description: 'Annual Food Festival with live music',
    category: 'Food & Beverage',
    promotionType: 'EVENT',
    startDate: '2025-04-01',
    endDate: '2025-04-03',
    address: '789 Park Road, Pune',
    contactInfo: {
      phone: '+91 98765 43212',
      email: 'info@foodfest.com',
      website: 'www.foodfest.com'
    },
    city: 'pune',
    featured: true,
    created_at: '2025-03-27T00:00:00Z'
  },
  {
    id: '4',
    businessName: 'TechSangham Hackathon',
    description: 'Join the annual TechSangham Hackathon at MIT Pune! Innovate, code, and win exciting prizes. Open to all students and professionals.',
    category: 'Entertainment',
    promotionType: 'EVENT',
    startDate: '2025-09-10',
    endDate: '2025-09-12',
    address: 'MIT College of Engineering, Kothrud, Pune',
    contactInfo: {
      phone: '+91 99887 76655',
      email: 'hackathon@techsangham.com',
      website: 'www.techsangham.com/hackathon'
    },
    city: 'pune',
    featured: true,
    created_at: '2025-08-11T00:00:00Z'
  },
  {
    id: '5',
    businessName: 'Green Grocers',
    description: 'Fresh organic produce now available at 20% off for a limited time!',
    category: 'Food & Beverage',
    promotionType: 'DISCOUNT',
    startDate: '2025-08-15',
    endDate: '2025-08-31',
    address: '789 Green Lane, Thane',
    contactInfo: {
      phone: '+91 91234 56789',
      email: 'info@greengrocers.com'
    },
    city: 'thane',
    featured: false,
    created_at: '2025-08-11T00:00:00Z'
  },
  {
    id: '6',
    businessName: 'Fitness First',
    description: 'New year, new you! Get 3 months free on annual gym memberships.',
    category: 'Services',
    promotionType: 'DISCOUNT',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    address: '101 Health Blvd, Borivali',
    contactInfo: {
      phone: '+91 87654 32109',
      email: 'contact@fitnessfirst.com',
      website: 'www.fitnessfirst.com'
    },
    city: 'borivali',
    featured: false,
    created_at: '2025-08-11T00:00:00Z'
  },
  {
    id: '7',
    businessName: 'Art & Craft Fair',
    description: 'Discover unique handmade crafts and local art. Live demonstrations and workshops daily!',
    category: 'Entertainment',
    promotionType: 'EVENT',
    startDate: '2025-10-05',
    endDate: '2025-10-07',
    address: 'Community Hall, Dadar',
    contactInfo: {
      phone: '+91 76543 21098',
      email: 'info@artcraftfair.com'
    },
    city: 'dadar',
    featured: true,
    created_at: '2025-08-11T00:00:00Z'
  },
  {
    id: '8',
    businessName: 'Bookworm Cafe',
    description: 'Enjoy a free coffee with any book purchase over ₹500. Cozy ambiance and wide selection.',
    category: 'Food & Beverage',
    promotionType: 'DISCOUNT',
    startDate: '2025-08-20',
    endDate: '2025-09-10',
    address: '22B Reading Lane, Kalyan',
    contactInfo: {
      phone: '+91 65432 10987',
      email: 'hello@bookwormcafe.com',
      website: 'www.bookwormcafe.com'
    },
    city: 'kalyan',
    featured: false,
    created_at: '2025-08-11T00:00:00Z'
  }
];