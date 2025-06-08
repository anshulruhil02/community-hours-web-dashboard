import { Submission } from '../types/User';

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTotalHours = (submissions: Submission[]) => {
  return submissions.reduce((total, sub) => total + (sub.hours || 0), 0);
};

export const getSubmissionStats = (submissions: Submission[]) => {
  const submitted = submissions.filter(s => s.status === 'SUBMITTED').length;
  const draft = submissions.filter(s => s.status === 'DRAFT').length;
  return { submitted, draft, total: submissions.length };
};

export const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};