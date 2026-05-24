export interface User {
  id: string
  email: string
  full_name: string
  home_airport: string | null
  currency: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: Record<string, unknown>
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Flight {
  origin_iata: string
  destination_iata: string
  price_usd: number
  duration_min: number
  stops: number
  cabin_class: string
  airline: string
  score: number
  score_breakdown: {
    price_score: number
    duration_score: number
    stops_score: number
  }
}

export interface Alert {
  id: string
  origin_iata: string
  destination_iata: string
  target_price_usd: number
  departure_date: string
  is_active: boolean
  last_checked_at: string | null
  triggered_at: string | null
}

export interface SavedSearch {
  id: string
  origin_iata: string
  destination_iata: string
  depart_date: string
  return_date: string | null
  passengers: number
  cabin_class: string
  created_at: string
}

export interface Itinerary {
  id: string
  prompt: string
  destinations: ItineraryLeg[]
  total_budget_usd: number
  duration_days: number
  llm_model: string
  created_at: string
}

export interface ItineraryLeg {
  origin: string
  destination: string
  date: string
  cabin: string
  price_usd: number
}

export interface Destination {
  destination_iata: string
  city: string
  country: string
  price_usd: number
  duration_min: number
  price_score: number
  duration_score: number
  value_score: number
  composite_score: number
}

export interface Route {
  path: string[]
  total_distance_km: number
  legs: RouteLeg[]
}

export interface RouteLeg {
  origin: string
  destination: string
  distance_km: number
  avg_duration_min: number
  avg_price_usd: number
}

export interface CarbonResult {
  origin_iata: string
  destination_iata: string
  distance_km: number
  cabin_class: string
  emissions_kg: number
  emissions_with_rfi_kg: number
  comparison: {
    economy: number
    business: number
    first: number
  }
}

export interface AdminStats {
  total_users: number
  total_searches: number
  total_alerts: number
  total_itineraries: number
  total_saved_searches: number
}