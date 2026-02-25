import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ImagePost, Notification } from '../types';
import { mockUsers, mockImages } from '../data/mockData';
import { storage, calculateScore } from '../utils/helpers';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  banUser: (userId: string) => void;
  warnUser: (userId: string) => void;
  sendNotification: (userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  bannedUsers: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bannedUsers, setBannedUsers] = useState<string[]>(() => {
    return storage.get<string[]>('rategallery_banned', []);
  });

  useEffect(() => {
    // Check for existing session
    const savedUser = storage.get<User | null>('rategallery_user', null);
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

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

  const followUser = (userId: string) => {
    if (user && !user.following.includes(userId)) {
      const updatedUser = {
        ...user,
        following: [...user.following, userId],
      };
      setUser(updatedUser);
      storage.set('rategallery_user', updatedUser);
    }
  };

  const unfollowUser = (userId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        following: user.following.filter(id => id !== userId),
      };
      setUser(updatedUser);
      storage.set('rategallery_user', updatedUser);
    }
  };

  const isFollowing = (userId: string): boolean => {
    return user?.following.includes(userId) || false;
  };

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
        signup,
        logout,
        updateUser,
        followUser,
        unfollowUser,
        isFollowing,
        banUser,
        warnUser,
        sendNotification,
        bannedUsers,
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
  getPublicImages: () => ImagePost[];
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

  const getPublicImages = (): ImagePost[] => {
    return images.filter(img => img.isApproved);
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
