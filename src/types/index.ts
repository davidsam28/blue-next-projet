export * from './database'

export interface DonationFormData {
  amount: number
  customAmount?: number
  firstName: string
  lastName: string
  email: string
  isRecurring: boolean
  frequency?: 'monthly' | 'quarterly' | 'annually'
  message?: string
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface AdminStats {
  totalDonations: number
  totalDonors: number
  monthlyTotal: number
  stripeTotal: number
  zelleTotal: number
  cashappTotal: number
  recentDonations: import('./database').DonationRecord[]
}
