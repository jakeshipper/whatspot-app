import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to call `Edge Function
export const getRecommendations = async (params: {
  location: { lat: number; lng: number }
  radius_km?: number
  budget_max?: string
  chips?: string[]
  category?: string | null
  query?: string  // Add this line
}) => {
  const response = await fetch(`${supabaseUrl}/functions/v1/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify(params)
  })
  
  if (!response.ok) {
    throw new Error('Failed to get recommendations')
  }
  
  return response.json()
}