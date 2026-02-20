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

export interface EnrollmentFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  age: string
  school: string
  address: string
  city: string
  state: string
  zip: string
  interests: string[]
  experience_level: string
  instagram: string
  tiktok: string
  soundcloud: string
  youtube: string
  music_links: string
  how_heard: string
  additional_notes: string
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
