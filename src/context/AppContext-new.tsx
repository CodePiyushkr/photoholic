import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, ImagePost, Notification } from '../types'
import { supabase } from './supabase'
import * as authService from './auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginGoogle: () => Promise<{ success: boolean; error?: string }>
  signup: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  followUser: (userId: string) => Promise<boolean>
  unfollowUser: (userId: string) => Promise<boolean>
  isFollowing: (userId: string) => boolean
  getFollowers: (userId: string) => string[]
  getFollowing: (userId: string) => string[]
  banUser: (userId: string) => Promise<void>
  warnUser: (userId: string) => Promise<void>
  sendNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>
  allUsers: User[]
  bannedUsers: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [bannedUsers, setBannedUsers] = useState<string[]>([])
  const [userFollowing, setUserFollowing] = useState<Set<string>>(new Set())

  // Initialize user session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true)

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Fetch user profile
          const userProfile = await authService.getCurrentUser()
          if (userProfile) {
            setUser(userProfile)

            // Fetch user's following list
            const { data: followingData } = await supabase
              .from('followers')
              .select('following_id')
              .eq('follower_id', session.user.id)

            if (followingData) {
              setUserFollowing(new Set(followingData.map(f => f.following_id)))
            }
          }
        }

        // Fetch all users
        const users = await authService.getAllUsers()
        setAllUsers(users)
      } catch (error) {
        console.error('Session init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await authService.getCurrentUser()
        if (userProfile) {
          setUser(userProfile)

          // Fetch user's following list
          const { data: followingData } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', session.user.id)

          if (followingData) {
            setUserFollowing(new Set(followingData.map(f => f.following_id)))
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserFollowing(new Set())
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loginEmail = async (email: string, password: string) => {
    try {
      const result = await authService.signInWithEmail({ email, password })

      if (result.success && result.user) {
        setUser(result.user)

        // Fetch following list
        const { data: followingData } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', result.user.id)

        if (followingData) {
          setUserFollowing(new Set(followingData.map(f => f.following_id)))
        }

        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  const loginGoogle = async () => {
    try {
      const result = await authService.signInWithGoogle()

      if (result.success && result.url) {
        window.location.href = result.url
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Google login failed' }
    }
  }

  const signup = async (name: string, username: string, email: string, password: string) => {
    try {
      const result = await authService.signUpWithEmail({
        name,
        username,
        email,
        password,
      })

      if (result.success) {
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Signup failed' }
    }
  }

  const logout = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setUserFollowing(new Set())
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setUser({ ...user, ...updates })
    } catch (error) {
      console.error('Update user error:', error)
    }
  }

  const followUser = async (targetUserId: string) => {
    if (!user) return false

    try {
      const success = await authService.followUser(user.id, targetUserId)

      if (success) {
        setUserFollowing(prev => new Set([...prev, targetUserId]))
      }

      return success
    } catch (error) {
      console.error('Follow error:', error)
      return false
    }
  }

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return false

    try {
      const success = await authService.unfollowUser(user.id, targetUserId)

      if (success) {
        setUserFollowing(prev => {
          const next = new Set(prev)
          next.delete(targetUserId)
          return next
        })
      }

      return success
    } catch (error) {
      console.error('Unfollow error:', error)
      return false
    }
  }

  const isFollowing = (targetUserId: string): boolean => {
    return userFollowing.has(targetUserId)
  }

  const getFollowers = (userId: string): string[] => {
    // This would fetch from database in real implementation
    const user_data = allUsers.find(u => u.id === userId)
    return user_data?.followers || []
  }

  const getFollowing = (userId: string): string[] => {
    if (userId === user?.id) {
      return Array.from(userFollowing)
    }

    const user_data = allUsers.find(u => u.id === userId)
    return user_data?.following || []
  }

  const banUser = async (userId: string) => {
    if (!user?.isAdmin) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_banned: true })
        .eq('id', userId)

      if (error) throw error

      setBannedUsers(prev => [...prev, userId])
      setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, isAdmin: false } : u)))
    } catch (error) {
      console.error('Ban user error:', error)
    }
  }

  const warnUser = async (userId: string) => {
    if (!user?.isAdmin) return

    try {
      const targetUser = allUsers.find(u => u.id === userId)
      if (!targetUser) return

      const newWarnings = (targetUser.warnings || 0) + 1
      const shouldBan = newWarnings >= 3

      const { error } = await supabase
        .from('users')
        .update({
          warnings: newWarnings,
          is_banned: shouldBan,
        })
        .eq('id', userId)

      if (error) throw error

      if (shouldBan) {
        setBannedUsers(prev => [...prev, userId])
      }

      setAllUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, warnings: newWarnings, isAdmin: shouldBan ? false : u.isAdmin } : u
        )
      )
    } catch (error) {
      console.error('Warn user error:', error)
    }
  }

  const sendNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user) return

    try {
      const { error } = await supabase.from('notifications').insert([
        {
          recipient_id: notification.recipientId,
          sender_id: notification.senderId || user.id,
          type: notification.type,
          message: notification.message,
          photo_id: notification.photoId,
          read: false,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error('Send notification error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginEmail,
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
    allUsers,
    bannedUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
