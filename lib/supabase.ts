import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do Supabase
export type Profile = {
  id: string
  created_at: string
  updated_at: string
  username: string
  full_name: string
  avatar_url: string
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    language: string
  }
}

export type Transcript = {
  id: string
  created_at: string
  user_id: string
  audio_url: string
  text: string
  language: string
}

export type Insight = {
  id: string
  created_at: string
  user_id: string
  type: 'betting' | 'mvp' | 'other'
  content: string
  metadata: Record<string, any>
}

export type Favorite = {
  id: string
  created_at: string
  user_id: string
  type: 'twitch' | 'weather' | 'sports'
  data: {
    name: string
    identifier: string
    metadata?: Record<string, any>
  }
} 