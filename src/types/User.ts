export interface Submission {
  id: string;
  status: 'DRAFT' | 'SUBMITTED';
  submissionDate: string | null;
  hours: number | null;
  orgName: string | null;
  createdAt: string;
}

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