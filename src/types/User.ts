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
export interface DatabaseUser {
  id: string;
  authProviderId: string;
  email: string;
  name: string;
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