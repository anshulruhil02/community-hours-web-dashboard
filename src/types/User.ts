export interface Submission {
  id: string;
  orgName: string | null;
  hours: number | null;
  telephone: number | null;
  supervisorName: string | null;
  submissionDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  preApprovedSignatureUrl: string | null;
  supervisorSignatureUrl: string | null;
  status: SubmissionStatus;
}

type SubmissionStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
type UserRole = "SCHOOL_ADMIN" | "BOARD_ADMIN" | "STUDENT";

export interface DatabaseUser {
  id: string;
  authProviderId: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string | null;
  oen: string | null;
  principal: string | null;
  dateOfBirth: string | null;
  parentSignatureUrl: string | null;
  parentSignatureDate: string | null;
  studentSignatureUrl: string | null;
  studentSignatureDate: string | null;
  createdAt: string;
  updatedAt: string;
  Submissions: Submission[];
}

export interface AuditTrailEntry {
  id: string;
  action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  previousStatus?: string;
  newStatus: string;
  performedByName: string;
  performedByRole: string;
  schoolName?: string;
  rejectionReason?: string;
  timestamp: string;
  submissionHours?: number;
  orgName?: string;
}

export interface RecentActivityEntry {
  id: string;
  studentName: string;
  action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  newStatus: string;
  performedByName: string;
  performedByRole: string;
  schoolName?: string;
  timestamp: string;
  orgName?: string;
  submissionHours?: number;
}

export interface AuditStatistics {
  period: {
    startDate: string;
    endDate: string;
  };
  statistics: Array<{
    action: string;
    role: string;
    count: number;
  }>;
  summary: {
    totalActions: number;
    totalSubmissions: number;
    totalApprovals: number;
    totalRejections: number;
  };
}