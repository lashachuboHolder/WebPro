const { v4: uuidv4 } = require('uuid');

const users = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@fundstart.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'inf-001',
    name: 'Olivia Chen',
    email: 'olivia@fundstart.com',
    password: 'olivia123',
    role: 'influencer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 'inf-002',
    name: 'Marcus Rivera',
    email: 'marcus@fundstart.com',
    password: 'marcus123',
    role: 'influencer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'donor-001',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'sarah123',
    role: 'donor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'donor-002',
    name: 'James Park',
    email: 'james@example.com',
    password: 'james123',
    role: 'donor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    createdAt: '2024-01-20T00:00:00Z'
  }
];

const campaigns = [
  {
    id: 'camp-001',
    influencerId: 'inf-001',
    title: 'Raising Capital for Inhouse EV Startup',
    description: 'A unique Connected EV for everyday transport, leisure & long fun. We are building the future of sustainable transportation with cutting-edge electric vehicle technology. Our team of engineers and designers have spent 3 years developing this revolutionary EV platform that promises to change how people commute.',
    shortDescription: 'Revolutionary EV for everyday commuters and adventure seekers.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Tech',
    goalAmount: 50000,
    raisedAmount: 42500,
    investorCount: 205,
    backers: 50,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-06-30T00:00:00Z',
    status: 'active',
    milestoneAmount: 25000,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'camp-002',
    influencerId: 'inf-001',
    title: 'Raising Capital for Playhouse Startup',
    description: 'The wandering paws & Premium Playhouse for dog owners. We believe every pet deserves a premium living space. Our innovative modular playhouses are designed with both aesthetics and functionality in mind, perfect for modern pet owners who want the best for their furry companions.',
    shortDescription: 'Premium modular playhouses for modern pet owners.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    category: 'Lifestyle',
    goalAmount: 30000,
    raisedAmount: 15000,
    investorCount: 15,
    backers: 30,
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-07-15T00:00:00Z',
    status: 'active',
    milestoneAmount: 45000,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'camp-003',
    influencerId: 'inf-002',
    title: 'Food Truck Startup for Selling Fresh Burritos & Fast Food Items',
    description: 'Fresh, fast, and delicious burritos on wheels! We are bringing authentic Mexican cuisine to the streets with our modern food truck. Our recipes have been perfected over generations, using only the freshest ingredients sourced from local farms.',
    shortDescription: 'Authentic Mexican street food brought to your neighborhood.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    category: 'Food',
    goalAmount: 25000,
    raisedAmount: 18750,
    investorCount: 89,
    backers: 45,
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-05-30T00:00:00Z',
    status: 'active',
    milestoneAmount: 25000,
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'camp-004',
    influencerId: 'inf-002',
    title: 'Fintech Smart Card for Junior for Financial Habits',
    description: 'Teaching kids financial literacy through gamification and smart spending. Our innovative smart card system helps parents teach their children about money management in a fun and engaging way, building healthy financial habits from an early age.',
    shortDescription: 'Smart fintech card helping kids learn financial literacy.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    category: 'Tech',
    goalAmount: 60000,
    raisedAmount: 45000,
    investorCount: 234,
    backers: 120,
    startDate: '2024-01-10T00:00:00Z',
    endDate: '2024-08-01T00:00:00Z',
    status: 'active',
    milestoneAmount: 45000,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'camp-005',
    influencerId: 'inf-002',
    title: 'Mini Computer for Gamers & Streamers',
    description: 'Compact powerhouse designed for next-gen gaming and streaming. This mini PC packs desktop-level performance into a palm-sized form factor, perfect for gamers and streamers who need power without the bulk.',
    shortDescription: 'Compact powerhouse PC for gaming and streaming.',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
    category: 'Tech',
    goalAmount: 40000,
    raisedAmount: 18000,
    investorCount: 156,
    backers: 67,
    startDate: '2024-02-15T00:00:00Z',
    endDate: '2024-07-31T00:00:00Z',
    status: 'active',
    milestoneAmount: 18000,
    createdAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'camp-006',
    influencerId: 'inf-001',
    title: 'Raising Capital for Biotech Gadget Startup',
    description: 'Revolutionary biotech device for personal health monitoring. Our wearable biotech gadget continuously monitors vital health metrics and provides AI-powered insights to help users make informed decisions about their health and lifestyle.',
    shortDescription: 'AI-powered wearable for continuous health monitoring.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    category: 'Health',
    goalAmount: 80000,
    raisedAmount: 32000,
    investorCount: 98,
    backers: 40,
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-09-01T00:00:00Z',
    status: 'active',
    milestoneAmount: 16000,
    createdAt: '2024-03-01T00:00:00Z'
  }
];

const donations = [
  {
    id: 'don-001',
    campaignId: 'camp-001',
    donorId: 'donor-001',
    donorName: 'Sarah Johnson',
    amount: 132,
    message: 'Great project! Love the EV concept.',
    paymentMethod: 'VISA',
    tax: 30,
    convenienceFee: 5,
    totalPaid: 167,
    createdAt: '2024-02-10T10:30:00Z',
    status: 'completed'
  },
  {
    id: 'don-002',
    campaignId: 'camp-001',
    donorId: 'donor-002',
    donorName: 'James Park',
    amount: 500,
    message: 'Excited about this EV startup!',
    paymentMethod: 'Mastercard',
    tax: 50,
    convenienceFee: 10,
    totalPaid: 560,
    createdAt: '2024-02-12T14:20:00Z',
    status: 'completed'
  },
  {
    id: 'don-003',
    campaignId: 'camp-003',
    donorId: 'donor-001',
    donorName: 'Sarah Johnson',
    amount: 222,
    message: 'Can\'t wait for burritos on my street!',
    paymentMethod: 'GCPS',
    tax: 22,
    convenienceFee: 5,
    totalPaid: 249,
    createdAt: '2024-02-15T09:15:00Z',
    status: 'completed'
  },
  {
    id: 'don-004',
    campaignId: 'camp-004',
    donorId: 'donor-002',
    donorName: 'James Park',
    amount: 300,
    message: 'Teaching kids about money is so important.',
    paymentMethod: 'NCTO',
    tax: 30,
    convenienceFee: 8,
    totalPaid: 338,
    createdAt: '2024-02-20T16:45:00Z',
    status: 'completed'
  },
  {
    id: 'don-005',
    campaignId: 'camp-002',
    donorId: 'donor-001',
    donorName: 'Sarah Johnson',
    amount: 150,
    message: 'My dog will love this!',
    paymentMethod: 'VISA',
    tax: 15,
    convenienceFee: 5,
    totalPaid: 170,
    createdAt: '2024-03-01T11:00:00Z',
    status: 'completed'
  }
];

module.exports = { users, campaigns, donations };
