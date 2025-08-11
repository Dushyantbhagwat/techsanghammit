import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jlzygxfwayaynrwviush.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsenlneGZ3YXlheW5yd3ZpdXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTc4NjIsImV4cCI6MjA2OTYzMzg2Mn0.6U9E2N1ISO_MZ_HAceIiphx-HsKn5a2D-AsIl7TWxIo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for hazard data
export interface HazardImage {
  id: string
  name: string
  url: string
  metadata: {
    size: number
    mimetype: string
    lastModified: string
    cacheControl?: string
    contentLength?: number
  }
  created_at: string
  updated_at: string
  last_accessed_at: string
  // Custom metadata that might be stored
  customMetadata?: {
    latitude?: number
    longitude?: number
    incidentType?: string
    description?: string
    reportedBy?: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    status?: 'reported' | 'investigating' | 'resolved'
    address?: string
    city?: string
  }
}

export interface HazardReport {
  id: string
  image_path: string
  latitude?: number
  longitude?: number
  incident_type: string
  description?: string
  reported_by?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'investigating' | 'resolved'
  address?: string
  city?: string
  created_at: string
  updated_at: string
}

// Storage bucket name and folder path
export const HAZARDS_BUCKET = 'images'
export const HAZARDS_FOLDER_PATH = 'issues/7d897e3c-eb27-4570-bbcf-c1ac6a552250'

// Helper function to get public URL for an image
export const getImageUrl = (fileName: string): string => {
  const fullPath = `${HAZARDS_FOLDER_PATH}/${fileName}`
  const { data } = supabase.storage.from(HAZARDS_BUCKET).getPublicUrl(fullPath)
  return data.publicUrl
}

// Helper function to get the full storage path
export const getFullStoragePath = (fileName: string): string => {
  return `${HAZARDS_FOLDER_PATH}/${fileName}`
}

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to get severity color
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'low': return 'text-green-400'
    case 'medium': return 'text-yellow-400'
    case 'high': return 'text-orange-400'
    case 'critical': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'reported': return 'text-blue-400'
    case 'investigating': return 'text-yellow-400'
    case 'resolved': return 'text-green-400'
    default: return 'text-gray-400'
  }
}
