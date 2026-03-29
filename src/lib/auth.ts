import { supabase } from './supabase'
import { User } from '../types'

export interface AuthResponse {
  success: boolean
  error?: string
  user?: User
}

export interface SignUpData {
  email: string
  password: string
  name: string
  username: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up with email and password
export const signUpWithEmail = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    // Create user profile in database
    const { error: profileError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        email: data.email,
        username: data.username,
        name: data.name,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=E60023&color=fff&size=200`,
        is_private: false,
        is_admin: false,
        created_at: new Date().toISOString(),
      },
    ])

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign up failed',
    }
  }
}

// Sign in with email and password
export const signInWithEmail = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) throw error
    if (!authData.user) throw new Error('Sign in failed')

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError

    return {
      success: true,
      user: profile,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
    }
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<{
  success: boolean
  error?: string
  url?: string
}> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
    if (!data.url) throw new Error('OAuth URL generation failed')

    return { success: true, url: data.url }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google sign in failed',
    }
  }
}

// Sign out
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    }
  }
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return null

    return profile
  } catch (error) {
    return null
  }
}

// Follow user
export const followUser = async (userId: string, followingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('followers').insert([
      {
        follower_id: userId,
        following_id: followingId,
      },
    ])

    if (error && error.code !== '23505') throw error // 23505 is unique constraint error
    return true
  } catch (error) {
    return false
  }
}

// Unfollow user
export const unfollowUser = async (userId: string, followingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', followingId)

    if (error) throw error
    return true
  } catch (error) {
    return false
  }
}

// Check if following
export const isFollowing = async (userId: string, followingId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', followingId)
      .single()

    if (error) return false
    return !!data
  } catch (error) {
    return false
  }
}

// Get user by username
export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) return null
    return data
  } catch (error) {
    return null
  }
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase.from('users').select('*')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

// Upload photo
export const uploadPhoto = async (
  userId: string,
  file: File,
  photoData: {
    title: string
    description?: string
    tags?: string[]
  }
): Promise<{ success: boolean; error?: string; photoId?: string }> => {
  try {
    // Upload image to storage
    const fileName = `${userId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName)

    // Create photo record in database
    const { data: photoData_, error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          user_id: userId,
          title: photoData.title,
          description: photoData.description,
          tags: photoData.tags || [],
          image_url: data.publicUrl,
          is_approved: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (dbError) throw dbError
    if (!photoData_ || photoData_.length === 0) throw new Error('Photo creation failed')

    return { success: true, photoId: photoData_[0].id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}
