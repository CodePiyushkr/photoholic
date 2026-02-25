// Utility functions

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Convert 1-10 rating to 5 star scale
export function ratingToStars(rating: number): number {
  return Math.round((rating / 2) * 10) / 10;
}

// Format date to relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears}y ago`;
  if (diffMonths > 0) return `${diffMonths}mo ago`;
  if (diffWeeks > 0) return `${diffWeeks}w ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

// Format number with K/M suffix
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Calculate leaderboard score: (Images × 0.4) + (Avg Rating × 0.6)
export function calculateScore(totalImages: number, averageRating: number): number {
  return Math.round((totalImages * 0.4 + averageRating * 0.6) * 100) / 100;
}

// Get user's leaderboard rank
export function getUserRank(userId: string, users: { id: string; totalImages: number; averageRating: number; isAdmin?: boolean }[]): number | null {
  // Filter out admins and users with no images
  const eligibleUsers = users.filter(u => !u.isAdmin && u.totalImages > 0);
  
  // Calculate scores and sort
  const rankedUsers = eligibleUsers
    .map(user => ({
      id: user.id,
      score: calculateScore(user.totalImages, user.averageRating),
    }))
    .sort((a, b) => b.score - a.score);
  
  // Find user's rank (1-indexed)
  const userIndex = rankedUsers.findIndex(u => u.id === userId);
  return userIndex >= 0 ? userIndex + 1 : null;
}

// Get rank badge text based on rank
export function getRankBadgeText(rank: number | null): string | null {
  if (rank === null) return null;
  if (rank === 1) return '🥇 #1';
  if (rank === 2) return '🥈 #2';
  if (rank === 3) return '🥉 #3';
  if (rank <= 5) return '🏆 Top 5';
  if (rank <= 10) return '⭐ Top 10';
  return null;
}

// Generate share URL
export function getShareUrl(imageId: string): string {
  return `${window.location.origin}/photo/${imageId}`;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Get user location from browser
export async function getUserLocation(): Promise<{ country: string; state: string; city: string } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using a free reverse geocoding API
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          resolve({
            country: data.countryName || 'Unknown',
            state: data.principalSubdivision || 'Unknown',
            city: data.city || data.locality || 'Unknown',
          });
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 10000 }
    );
  });
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone
export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}

// Validate username
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Failed to remove from localStorage');
    }
  },
};
