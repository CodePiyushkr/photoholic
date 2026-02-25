import { User, ImagePost, UserLocation } from '../types';

// Sample locations
const locations: UserLocation[] = [
  { country: 'United States', state: 'California', city: 'Los Angeles' },
  { country: 'United States', state: 'New York', city: 'New York City' },
  { country: 'United Kingdom', state: 'England', city: 'London' },
  { country: 'India', state: 'Maharashtra', city: 'Mumbai' },
  { country: 'India', state: 'Karnataka', city: 'Bangalore' },
  { country: 'Japan', state: 'Tokyo', city: 'Tokyo' },
  { country: 'Germany', state: 'Bavaria', city: 'Munich' },
  { country: 'Australia', state: 'New South Wales', city: 'Sydney' },
  { country: 'Canada', state: 'Ontario', city: 'Toronto' },
  { country: 'France', state: 'Île-de-France', city: 'Paris' },
];

// Sample avatar URLs (using UI Avatars API)
const generateAvatar = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E60023&color=fff&size=200`;

// Sample image URLs (using Picsum for demo)
const sampleImages = [
  'https://picsum.photos/seed/1/800/1200',
  'https://picsum.photos/seed/2/800/600',
  'https://picsum.photos/seed/3/800/1000',
  'https://picsum.photos/seed/4/800/800',
  'https://picsum.photos/seed/5/800/1400',
  'https://picsum.photos/seed/6/800/700',
  'https://picsum.photos/seed/7/800/900',
  'https://picsum.photos/seed/8/800/1100',
  'https://picsum.photos/seed/9/800/650',
  'https://picsum.photos/seed/10/800/1300',
  'https://picsum.photos/seed/11/800/750',
  'https://picsum.photos/seed/12/800/850',
  'https://picsum.photos/seed/13/800/1000',
  'https://picsum.photos/seed/14/800/600',
  'https://picsum.photos/seed/15/800/1200',
  'https://picsum.photos/seed/16/800/900',
  'https://picsum.photos/seed/17/800/700',
  'https://picsum.photos/seed/18/800/1100',
  'https://picsum.photos/seed/19/800/800',
  'https://picsum.photos/seed/20/800/950',
  'https://picsum.photos/seed/21/800/1050',
  'https://picsum.photos/seed/22/800/600',
  'https://picsum.photos/seed/23/800/1300',
  'https://picsum.photos/seed/24/800/750',
  'https://picsum.photos/seed/25/800/850',
  'https://picsum.photos/seed/26/800/1000',
  'https://picsum.photos/seed/27/800/650',
  'https://picsum.photos/seed/28/800/1150',
  'https://picsum.photos/seed/29/800/700',
  'https://picsum.photos/seed/30/800/900',
];

const tags = [
  ['nature', 'landscape', 'mountains'],
  ['portrait', 'photography', 'model'],
  ['street', 'urban', 'city'],
  ['food', 'delicious', 'cooking'],
  ['travel', 'adventure', 'explore'],
  ['art', 'creative', 'design'],
  ['architecture', 'building', 'modern'],
  ['sunset', 'golden hour', 'sky'],
  ['wildlife', 'animals', 'nature'],
  ['fashion', 'style', 'outfit'],
];

const titles = [
  'Golden Hour Magic',
  'Urban Dreams',
  'Serene Landscape',
  'Portrait Session',
  'City Lights',
  'Nature\'s Beauty',
  'Architectural Wonder',
  'Street Photography',
  'Wildlife Moment',
  'Creative Vision',
  'Sunset Vibes',
  'Mountain Peak',
  'Ocean Waves',
  'Forest Trail',
  'Desert Sunset',
];

// Generate mock users (initially without image stats - will be updated after images are created)
const initialUsers: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@rategallery.com',
    phone: '+1234567890',
    name: 'Admin User',
    bio: 'Platform administrator',
    avatar: generateAvatar('Admin User'),
    location: locations[0],
    isPrivate: false,
    isAdmin: true,
    createdAt: '2024-01-01T00:00:00Z',
    followers: [],
    following: [],
    totalImages: 0,
    averageRating: 0,
    score: 0,
    warnings: 0,
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const name = [
      'Emma Wilson', 'James Chen', 'Sofia Rodriguez', 'Liam Patel',
      'Olivia Kim', 'Noah Martinez', 'Ava Johnson', 'William Brown',
      'Isabella Davis', 'Benjamin Garcia', 'Mia Thompson', 'Lucas Anderson',
      'Charlotte Taylor', 'Henry Lee', 'Amelia White', 'Alexander Moore',
      'Harper Jackson', 'Daniel Harris', 'Evelyn Clark', 'Michael Lewis'
    ][i];
    const username = name.toLowerCase().replace(' ', '_');
    
    return {
      id: `user-${i + 1}`,
      username,
      email: `${username}@email.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      name,
      bio: `Photography enthusiast | ${locations[i % locations.length].city}`,
      avatar: generateAvatar(name),
      location: locations[i % locations.length],
      isPrivate: i % 5 === 0,
      isAdmin: false,
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      followers: Array.from({ length: Math.floor(Math.random() * 50) }, (_, j) => `user-${j + 1}`),
      following: Array.from({ length: Math.floor(Math.random() * 30) }, (_, j) => `user-${j + 1}`),
      totalImages: 0,
      averageRating: 0,
      score: 0,
      warnings: 0,
    };
  }),
];

// Assign images to specific users (distribute evenly)
const userImageAssignments: { [key: string]: number[] } = {
  'user-1': [0, 1],           // Emma Wilson - 2 images
  'user-2': [2, 3, 4],        // James Chen - 3 images
  'user-3': [5],              // Sofia Rodriguez - 1 image
  'user-4': [6, 7],           // Liam Patel - 2 images
  'user-5': [8, 9, 10, 11],   // Olivia Kim - 4 images
  'user-6': [12],             // Noah Martinez - 1 image
  'user-7': [13, 14],         // Ava Johnson - 2 images
  'user-8': [15, 16, 17],     // William Brown - 3 images
  'user-9': [18],             // Isabella Davis - 1 image
  'user-10': [19, 20],        // Benjamin Garcia - 2 images
  'user-11': [21, 22, 23],    // Mia Thompson - 3 images
  'user-12': [24],            // Lucas Anderson - 1 image
  'user-13': [25, 26],        // Charlotte Taylor - 2 images
  'user-14': [27, 28, 29],    // Henry Lee - 3 images
  // Users 15-20 have 0 images
};

// Generate mock images with assigned users
export const mockImages: ImagePost[] = sampleImages.map((imageUrl, i) => {
  // Find which user owns this image
  let assignedUserId = 'user-1';
  for (const [userId, imageIndexes] of Object.entries(userImageAssignments)) {
    if (imageIndexes.includes(i)) {
      assignedUserId = userId;
      break;
    }
  }
  
  const user = initialUsers.find(u => u.id === assignedUserId) || initialUsers[1];
  const ratingsCount = Math.floor(Math.random() * 50) + 5;
  const ratings = Array.from({ length: ratingsCount }, (_, j) => ({
    userId: `user-${j + 1}`,
    rating: Math.floor(Math.random() * 5) + 6,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  }));
  const averageRating = Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10;
  const starRating = averageRating / 2;

  return {
    id: `image-${i + 1}`,
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    imageUrl,
    title: titles[i % titles.length],
    tags: tags[i % tags.length],
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    ratings,
    averageRating,
    totalRatings: ratingsCount,
    starRating,
    isFlagged: i === 5 || i === 12,
    flagReason: i === 5 ? 'Potential copyright violation detected' : i === 12 ? 'Image may be from internet' : undefined,
    isApproved: i !== 5 && i !== 12,
    reports: i === 8 ? [{
      id: 'report-1',
      userId: 'user-3',
      reason: 'copyright',
      description: 'This image appears to be stolen from another photographer',
      createdAt: new Date().toISOString(),
      status: 'pending',
    }] : [],
  };
});

// Now update user stats based on actual images
export const mockUsers: User[] = initialUsers.map(user => {
  const userImages = mockImages.filter(img => img.userId === user.id);
  const totalImages = userImages.length;
  const averageRating = totalImages > 0 
    ? Math.round((userImages.reduce((sum, img) => sum + img.averageRating, 0) / totalImages) * 10) / 10
    : 0;
  const score = Math.round((totalImages * 0.4 + averageRating * 0.6) * 100) / 100;
  
  return {
    ...user,
    totalImages,
    averageRating,
    score,
  };
});

// Get unique countries, states, cities for filters
export const getUniqueLocations = () => {
  const countries = [...new Set(mockUsers.map(u => u.location.country))];
  const states = [...new Set(mockUsers.map(u => u.location.state))];
  const cities = [...new Set(mockUsers.map(u => u.location.city))];
  return { countries, states, cities };
};

// Demo current user (for testing logged-in state)
export const demoUser: User = mockUsers[1];
