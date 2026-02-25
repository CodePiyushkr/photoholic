// User types
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  name: string;
  bio: string;
  avatar: string;
  location: UserLocation;
  isPrivate: boolean;
  isAdmin: boolean;
  createdAt: string;
  followers: string[];
  following: string[];
  totalImages: number;
  averageRating: number;
  score: number;
  warnings: number;
}

export interface UserLocation {
  country: string;
  state: string;
  city: string;
  lat?: number;
  lng?: number;
}

// Image types
export interface ImagePost {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  imageUrl: string;
  title: string;
  tags: string[];
  createdAt: string;
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
  starRating: number;
  isFlagged: boolean;
  flagReason?: string;
  isApproved: boolean;
  reports: Report[];
}

export interface Rating {
  userId: string;
  rating: number;
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  reason: ReportReason;
  description?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export type ReportReason = 
  | 'spam'
  | 'nudity'
  | 'hate_speech'
  | 'violence'
  | 'harassment'
  | 'copyright'
  | 'false_information'
  | 'other';

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  totalImages: number;
  averageRating: number;
}

export interface LeaderboardFilters {
  country?: string;
  state?: string;
  city?: string;
  timeRange?: 'all' | 'month' | 'week';
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalImages: number;
  pendingReviews: number;
  totalReports: number;
  flaggedImages: number;
}

export interface FlaggedImage extends ImagePost {
  flagReason: string;
  flaggedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'rating' | 'follow' | 'warning' | 'system' | 'upload' | 'leaderboard';
  title: string;
  message: string;
  imageUrl?: string;
  linkTo?: string;
  isRead: boolean;
  createdAt: string;
}
