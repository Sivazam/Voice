export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  address: string;
  profilePictureUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  totalCasesFiled: number;
}

export interface Case {
  id: string;
  userId: string;
  status: CaseStatus;
  
  // Main Category
  mainCategory: string;
  
  // Personal Info
  caseTitle: string;
  name: string;
  email: string;
  phoneNumber: string;
  
  // Case Details
  caseDescription: string;
  voiceRecordingUrl?: string;
  voiceRecordingDuration?: number;
  
  // Location
  gpsLatitude?: number;
  gpsLongitude?: number;
  capturedAddress?: string;
  
  // Attachments
  attachments: Attachment[];
  
  // Metadata
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminComments?: string;
  rejectionReason?: string;
  resolvedAt?: Date;
  viewCount: number;
  
  // Privacy
  isPublic: boolean;
  
  // Relations
  user?: User;
  reviewer?: User;
}

export interface Attachment {
  id: string;
  caseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedCaseId?: string;
  isRead: boolean;
  createdAt: Date;
  
  // Relations
  user?: User;
  relatedCase?: Case;
}



export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN'
}

export enum CaseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum NotificationType {
  CASE_SUBMITTED = 'CASE_SUBMITTED',
  CASE_APPROVED = 'CASE_APPROVED',
  CASE_REJECTED = 'CASE_REJECTED',
  CASE_RESOLVED = 'CASE_RESOLVED',
  ADMIN_ALERT = 'ADMIN_ALERT'
}

// Form types
export interface CaseFormData {
  // Step 1: Category Selection
  mainCategory: string;
  
  // Step 2: Personal Information
  caseTitle: string;
  name: string;
  email: string;
  phoneNumber: string;
  
  // Step 3: Case Details
  caseDescription: string;
  voiceRecording?: File;
  
  // Step 4: Location & Evidence
  gpsLatitude?: number;
  gpsLongitude?: number;
  capturedAddress?: string;
  attachments: File[];
}

export interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  approvedCases: number;
  rejectedCases: number;
  resolvedCases: number;
  averageApprovalTime: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CaseFilters {
  status?: CaseStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  mainCategory?: string;
  searchTerm?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}