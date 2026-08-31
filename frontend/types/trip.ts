export interface Trip {
  id: number
  destination: string
  days: number | null
  budget: number
  daily_budget: number
  category: string
  travel_style: string
  ai_recommendation: string | null
  recommended_transportation: string
}