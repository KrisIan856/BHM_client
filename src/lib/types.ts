export type Role = "guardian" | "boarder" | null
export type PayStatus = "paid" | "pending" | "overdue"
export type ReceiptStatus = "pending_review" | "verified" | "rejected"
export type IncidentType = "missed_curfew" | "sos" | "missed_worship" | "maintenance" | "other"
export type CurfewStatus = "compliant" | "late" | "absent" | "pending"

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Boarder {
  id: string
  name: string
  room: string
  floor: string
  initials: string
  avatarColor: string
  phone: string
  email: string
  joinDate: string
  monthlyRate: number
  dueDay: number
  gracePeriodDays: number
  paymentStatus: PayStatus
  latePenaltyType: "flat" | "percentage"
  latePenaltyAmount: number
  emergencyContact: EmergencyContact
  job: string
}

export interface PaymentRecord {
  id: string
  boarderId: string
  period: string
  amount: number
  paidDate?: string
  method: "cash" | "gcash" | "bank_transfer" | "online"
  status: PayStatus
  receiptStatus?: ReceiptStatus
  receiptFileName?: string
  rejectionReason?: string
  recordedBy: "boarder" | "guardian"
  verifiedAt?: string
  verifiedBy?: string
  notes?: string
}

export interface AttendanceSession {
  id: string
  type: "morning" | "evening"
  date: string
  windowStart: string
  windowEnd: string
  qrValidityMins: number
}

export interface AttendanceRecord {
  id: string
  boarderId: string
  sessionId: string
  status: "present" | "absent"
  checkInTime?: string
  method: "qr" | "manual"
  overrideReason?: string
  overriddenBy?: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  priority: "normal" | "critical"
  recipients: string[] | "all"
  sentAt: string
  sentBy: string
  readBy: string[]
  acknowledgedBy: string[]
}

export interface VisitorEntry {
  id: string
  visitorName: string
  boarderId: string
  purpose: string
  timeIn: string
  timeOut?: string
  date: string
}

export interface Incident {
  id: string
  type: IncidentType
  boarderId?: string
  title: string
  description: string
  timestamp: string
  resolved: boolean
}

export interface MaintenanceReport {
  id: string
  boarderId: string
  room: string
  category: "plumbing" | "electrical" | "furniture" | "appliance" | "other"
  description: string
  status: "open" | "in_progress" | "resolved"
  submittedAt: string
  resolvedAt?: string
}

export interface CurfewRecord {
  id: string
  boarderId: string
  date: string
  curfewTime: string
  checkedInAt?: string
  status: CurfewStatus
}

export interface WorkshipSchedule {
  morningStart: string
  morningEnd: string
  morningQRMins: number
  eveningStart: string
  eveningEnd: string
  eveningQRMins: number
  absenceThreshold: number
}

export interface BillingSettings {
  dueDay: number
  gracePeriodDays: number
  penaltyType: "flat" | "percentage"
  penaltyAmount: number
  reminders: {
    before3: boolean
    before1: boolean
    onDay: boolean
    after1: boolean
    after3: boolean
  }
  channels: { inApp: boolean; sms: boolean; email: boolean }
}
