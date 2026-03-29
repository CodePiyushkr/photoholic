import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ImagePost, Notification } from '../types';
import { mockUsers, mockImages } from '../data/mockData';
import { storage, calculateScore } from '../utils/helpers';

// Type for storing user relationships
interface UserRelationships {
  [userId: string]: {
    followers: string[];
    following: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginGoogle: (email?: string) => Promise<{ success: boolean; error?: string; existingUser?: boolean; redirectUrl?: string }>;
  signup: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowers: (userId: string) => string[];
  getFollowing: (userId: string) => string[];
  banUser: (userId: string) => void;
  warnUser: (userId: string) => void;
  sendNotification: (userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  bannedUsers: string[];
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize relationships from mockUsers
const initializeRelationships = (): UserRelationships => {
  const saved = storage.get<UserRelationships | null>('rategallery_relationships', null);
  if (saved) return saved;
  
  const relationships: UserRelationships = {};
  mockUsers.forEach(user => {
    relationships[user.id] = {
      followers: [...user.followers],
      following: [...user.following],
    };
  });
  return relationships;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<UserRelationships>(initializeRelationships);
  const [bannedUsers, setBannedUsers] = useState<string[]>(() => {
    return storage.get<string[]>('rategallery_banned', []);
  });

  // Ensure all users have relationship entries (fixes reload issue)
  useEffect(() => {
    setRelationships(prev => {
      let updated = { ...prev };
      let hasChanges = false;
      
      mockUsers.forEach(user => {
        if (!updated[user.id]) {
          updated[user.id] = {
            followers: [...user.followers],
            following: [...user.following],
          };
          hasChanges = true;
        }
      });
      
      return hasChanges ? updated : prev;
    });
  }, []);

  useEffect(() => {
    // Check for existing session
    const savedUser = storage.get<User | null>('rategallery_user', null);
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  // Save relationships to localStorage whenever they change
  useEffect(() => {
    storage.set('rategallery_relationships', relationships);
  }, [relationships]);

  useEffect(() => {
    storage.set('rategallery_banned', bannedUsers);
  }, [bannedUsers]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Demo login: any valid email with password "password123"
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (!foundUser) {
      // For demo, create a session with the first non-admin user
      if (password === 'password123' || password === 'demo') {
        const demoUser = mockUsers[1];
        setUser(demoUser);
        storage.set('rategallery_user', demoUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    }

    // For demo purposes, accept "password123" or "demo"
    if (password !== 'password123' && password !== 'demo') {
      return { success: false, error: 'Invalid email or password' };
    }

    setUser(foundUser);
    storage.set('rategallery_user', foundUser);
    return { success: true };
  };

  const loginGoogle = async (email?: string): Promise<{ success: boolean; error?: string; existingUser?: boolean; redirectUrl?: string }> => {
    // Simulate Google OAuth API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // If email provided (from Signup), check if user exists
    if (email) {
      const existingUser = mockUsers.find(u => u.email === email);
      
      if (existingUser) {
        // User exists - log them in directly
        setUser(existingUser);
        storage.set('rategallery_user', existingUser);
        return { success: true, existingUser: true };
      } else {
        // New user - redirect to complete profile
        return { 
          success: true, 
          existingUser: false, 
          redirectUrl: `/complete-profile?email=${encodeURIComponent(email)}` 
        };
      }
    }

    // For login page - just check demo flow
    const demoUser = mockUsers[0];
    setUser(demoUser);
    storage.set('rategallery_user', demoUser);
    return { success: true };
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if username or email exists
    if (mockUsers.some(u => u.username === userData.username)) {
      return { success: false, error: 'Username already taken' };
    }
    if (mockUsers.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username || '',
      email: userData.email || '',
      phone: userData.phone || '',
      name: userData.name || '',
      bio: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || '')}&background=E60023&color=fff&size=200`,
      location: userData.location || { country: 'Unknown', state: 'Unknown', city: 'Unknown' },
      isPrivate: false,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      followers: [],
      following: [],
      totalImages: 0,
      averageRating: 0,
      score: 0,
      warnings: 0,
    };

    setUser(newUser);
    storage.set('rategallery_user', newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storage.remove('rategallery_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      if (updates.totalImages !== undefined || updates.averageRating !== undefined) {
        updatedUser.score = calculateScore(
          updates.totalImages ?? user.totalImages,
          updates.averageRating ?? user.averageRating
        );
      }
      setUser(updatedUser);
      storage.set('rategallery_user', updatedUser);
    }
  };

  const followUser = (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;
    
    // Update relationships state (both current user's following AND target user's followers)
    setRelationships(prev => {
      const currentUserRel = prev[user.id] || { followers: [], following: [] };
      const targetUserRel = prev[targetUserId] || { followers: [], following: [] };
      
      // Check if already following
      if (currentUserRel.following.includes(targetUserId)) return prev;
      
      return {
        ...prev,
        [user.id]: {
          ...currentUserRel,
          following: [...currentUserRel.following, targetUserId],
        },
        [targetUserId]: {
          ...targetUserRel,
          followers: [...targetUserRel.followers, user.id],
        },
      };
    });

    // Also update the current user state for immediate UI feedback
    const updatedUser = {
      ...user,
      following: [...user.following, targetUserId],
    };
    setUser(updatedUser);
    storage.set('rategallery_user', updatedUser);
  };

  const unfollowUser = (targetUserId: string) => {
    if (!user) return;
    
    // Update relationships state (both sides)
    setRelationships(prev => {
      const currentUserRel = prev[user.id] || { followers: [], following: [] };
      const targetUserRel = prev[targetUserId] || { followers: [], following: [] };
      
      return {
        ...prev,
        [user.id]: {
          ...currentUserRel,
          following: currentUserRel.following.filter(id => id !== targetUserId),
        },
        [targetUserId]: {
          ...targetUserRel,
          followers: targetUserRel.followers.filter(id => id !== user.id),
        },
      };
    });

    // Update current user state
    const updatedUser = {
      ...user,
      following: user.following.filter(id => id !== targetUserId),
    };
    setUser(updatedUser);
    storage.set('rategallery_user', updatedUser);
  };

  const isFollowing = (userId: string): boolean => {
    if (!user) return false;
    const userRel = relationships[user.id];
    return userRel?.following.includes(userId) || false;
  };

  const getFollowers = (userId: string): string[] => {
    return relationships[userId]?.followers || [];
  };

  const getFollowing = (userId: string): string[] => {
    return relationships[userId]?.following || [];
  };

  // Get all users with real-time relationship data
  const allUsers = mockUsers.map(u => {
    const userRel = relationships[u.id];
    return {
      ...u,
      followers: userRel?.followers?.length > 0 ? userRel.followers : (u.followers || []),
      following: userRel?.following?.length > 0 ? userRel.following : (u.following || []),
    };
  });

  const banUser = (userId: string) => {
    if (!bannedUsers.includes(userId)) {
      setBannedUsers(prev => [...prev, userId]);
    }
  };

  const warnUser = (userId: string) => {
    // Send warning notification to the user
    const warningNotif: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'warning',
      title: '⚠️ Admin Warning',
      message: 'You have received a warning from an administrator. Please review our community guidelines.',
      linkTo: '/settings',
      isRead: false,
    };
    sendNotification(userId, warningNotif);
  };

  const sendNotification = (userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const existingNotifs = storage.get<Notification[]>(`notifications_${userId}`, []);
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    storage.set(`notifications_${userId}`, [newNotif, ...existingNotifs]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginGoogle,
        signup,
        logout,
        updateUser,
        followUser,
        unfollowUser,
        isFollowing,
        getFollowers,
        getFollowing,
        banUser,
        warnUser,
        sendNotification,
        bannedUsers,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Image context for managing images
interface ImageContextType {
  images: ImagePost[];
  addImage: (image: ImagePost) => void;
  rateImage: (imageId: string, userId: string, rating: number) => void;
  reportImage: (imageId: string, userId: string, reason: string, description?: string) => void;
  deleteImage: (imageId: string) => void;
  approveImage: (imageId: string) => void;
  flagImage: (imageId: string, reason: string) => void;
  clearReports: (imageId: string) => void;
  getUserImages: (userId: string) => ImagePost[];
  getPublicImages: (currentUser?: User | null) => ImagePost[];
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<ImagePost[]>(() => {
    return storage.get<ImagePost[]>('rategallery_images', mockImages);
  });

  useEffect(() => {
    storage.set('rategallery_images', images);
  }, [images]);

  const addImage = (image: ImagePost) => {
    setImages(prev => [image, ...prev]);
  };

  const rateImage = (imageId: string, userId: string, rating: number) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        const existingRatingIndex = img.ratings.findIndex(r => r.userId === userId);
        let newRatings = [...img.ratings];
        
        if (existingRatingIndex >= 0) {
          newRatings[existingRatingIndex] = { userId, rating, createdAt: new Date().toISOString() };
        } else {
          newRatings.push({ userId, rating, createdAt: new Date().toISOString() });
        }

        const averageRating = Math.round((newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length) * 10) / 10;
        const starRating = averageRating / 2;

        return {
          ...img,
          ratings: newRatings,
          averageRating,
          totalRatings: newRatings.length,
          starRating,
        };
      }
      return img;
    }));
  };

  const reportImage = (imageId: string, userId: string, reason: string, description?: string) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return {
          ...img,
          reports: [
            ...img.reports,
            {
              id: `report-${Date.now()}`,
              userId,
              reason: reason as any,
              description,
              createdAt: new Date().toISOString(),
              status: 'pending' as const,
            },
          ],
        };
      }
      return img;
    }));
  };

  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const approveImage = (imageId: string) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return { ...img, isApproved: true, isFlagged: false, flagReason: undefined };
      }
      return img;
    }));
  };

  const flagImage = (imageId: string, reason: string) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return { ...img, isFlagged: true, flagReason: reason, isApproved: false };
      }
      return img;
    }));
  };

  const clearReports = (imageId: string) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return { ...img, reports: [] };
      }
      return img;
    }));
  };

  const getUserImages = (userId: string): ImagePost[] => {
    return images.filter(img => img.userId === userId);
  };

  const getPublicImages = (currentUser?: User | null): ImagePost[] => {
    return images.filter(img => {
      // Must be approved
      if (!img.isApproved) return false;
      
      // Find the image owner
      const imageOwner = mockUsers.find(u => u.id === img.userId);
      if (!imageOwner) return false;
      
      // If owner has public account, show the image
      if (!imageOwner.isPrivate) return true;
      
      // If owner has private account:
      // - Show if it's the current user's own image
      // - Show if current user follows the owner
      if (currentUser) {
        if (currentUser.id === img.userId) return true;
        if (currentUser.following.includes(img.userId)) return true;
      }
      
      // Private account and not following - hide image
      return false;
    });
  };

  return (
    <ImageContext.Provider
      value={{
        images,
        addImage,
        rateImage,
        reportImage,
        deleteImage,
        approveImage,
        flagImage,
        clearReports,
        getUserImages,
        getPublicImages,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
}
