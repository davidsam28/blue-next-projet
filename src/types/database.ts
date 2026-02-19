export type DonationSource = 'stripe' | 'zelle' | 'cashapp'
export type DonationStatus = 'completed' | 'pending' | 'failed'
export type ContentType = 'text' | 'html' | 'image_url' | 'json'

export interface Donor {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  notes: string | null
  stripe_customer_id: string | null
}

export interface DonationRecord {
  id: string
  created_at: string
  updated_at: string
  donor_id: string | null
  amount: number
  source: DonationSource
  status: DonationStatus
  stripe_payment_intent_id: string | null
  notes: string | null
  recorded_by: string | null
  donation_date: string
  donor?: Donor
}

export interface SiteContent {
  id: string
  created_at: string
  updated_at: string
  page: string
  section: string
  content_type: ContentType
  content: string
  updated_by: string | null
}

export interface TeamMember {
  id: string
  created_at: string
  updated_at: string
  name: string
  title: string
  bio: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export interface Program {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string
  image_url: string | null
  display_order: number
  is_active: boolean
}

export interface SiteSetting {
  key: string
  value: string
  updated_at: string
  updated_by: string | null
}

export interface AdminEmailLog {
  id: string
  created_at: string
  sent_by: string | null
  recipient_email: string
  recipient_donor_id: string | null
  subject: string
  body: string
  status: string
}

export interface Database {
  public: {
    Tables: {
      donors: {
        Row: Donor
        Insert: Omit<Donor, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Donor, 'id' | 'created_at'>>
      }
      donation_records: {
        Row: DonationRecord
        Insert: Omit<DonationRecord, 'id' | 'created_at' | 'updated_at' | 'donor'>
        Update: Partial<Omit<DonationRecord, 'id' | 'created_at' | 'donor'>>
      }
      site_content: {
        Row: SiteContent
        Insert: Omit<SiteContent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SiteContent, 'id' | 'created_at'>>
      }
      team_members: {
        Row: TeamMember
        Insert: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TeamMember, 'id' | 'created_at'>>
      }
      programs: {
        Row: Program
        Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Program, 'id' | 'created_at'>>
      }
      site_settings: {
        Row: SiteSetting
        Insert: Omit<SiteSetting, 'updated_at'>
        Update: Partial<Omit<SiteSetting, 'key'>>
      }
      admin_email_log: {
        Row: AdminEmailLog
        Insert: Omit<AdminEmailLog, 'id' | 'created_at'>
        Update: Partial<AdminEmailLog>
      }
    }
  }
}
