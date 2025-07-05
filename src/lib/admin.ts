import { Session } from "next-auth"
import { User } from "@prisma/client"

export type AdminUser = User & {
  hostInfo?: {
    id: string
    isVerified: boolean
    verificationStatus: string
  }
  _count?: {
    listings: number
    reviews: number
    bookings: number
  }
}

export function isAdmin(session: Session | null): boolean {
  if (process.env.NODE_ENV === 'development' && 
      typeof window !== 'undefined' &&
      localStorage.getItem('devAdminOverride') === 'true') {
    return true
  }
  return session?.user.isAdmin ?? false
}

export async function requireAdmin(session: Session | null) {
  if (!isAdmin(session)) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export const ADMIN_PAGE_SIZE = 50

export type AdminStats = {
  totalUsers: number
  totalListings: number
  totalBookings: number
  pendingReviews: number
  pendingListings: number
  activeUsers: number
}

export type AdminAction = {
  type: 'user' | 'listing' | 'review' | 'system'
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject'
  targetId: string
  metadata?: Record<string, any>
  timestamp: Date
  adminId: string
} 