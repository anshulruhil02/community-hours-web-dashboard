// src/services/userService.ts
import { DatabaseUser, Submission, AuditTrailEntry, RecentActivityEntry, AuditStatistics, } from '../types/User';
import axiosInstance from '../api/axiosInstance';
export const userService = {
  // Use axiosInstance directly
  async getAllUsers(): Promise<DatabaseUser[]> {
    const response = await axiosInstance.get<DatabaseUser[]>('/users/all'); // Axios's .get() method
    return response.data; // Axios wraps the response data in a 'data' property
  },

  async getUserById(id: string): Promise<DatabaseUser> {
    console.log("getUserById called at", new Date().toISOString(), "with Axios instance:", axiosInstance);
    // Remove handlers log
    const response = await axiosInstance.get<DatabaseUser>(`/users/${id}`);
    console.log("Response headers:", response.config.headers, "at", new Date().toISOString());
    return response.data;
  },

  async fetchUserSubmissionById(id: string): Promise<Submission> {
    const response = await axiosInstance.get<Submission>(`/submissions/${id}`);
    return response.data;
  },

  async approveSubmission(id: string): Promise<Submission> {
    const response = await axiosInstance.patch<Submission>(`/submissions/${id}/approve`); // Axios .patch()
    return response.data;
  },

  async rejectSubmission(id: string, reason?: string): Promise<Submission> {
    const response = await axiosInstance.patch<Submission>(`/submissions/${id}/reject`, { reason }); // Axios handles JSON stringify
    return response.data;
  },

  async bulkApproveSubmissions(ids: string[]): Promise<any[]> {
    const response = await axiosInstance.patch<any[]>(`/submissions/bulk/approve`, { submissionIds: ids });
    return response.data;
  },

  async bulkRejectSubmissions(ids: string[], reason?: string): Promise<any[]> {
    const response = await axiosInstance.patch<any[]>(`/submissions/bulk/reject`, { submissionIds: ids, reason });
    return response.data;
  },

  async getSubmissionAuditTrail(submissionId: string): Promise<AuditTrailEntry[]> {
    const response = await axiosInstance.get<AuditTrailEntry[]>(`/submissions/${submissionId}/audit-trail`);
    console.log("getSubmissionAuditTrail response:", response.data);
    return response.data;
  },

  /**
   * Get recent audit activity across all submissions (Admin only)
   */
  async getRecentAuditActivity(limit: number = 25): Promise<RecentActivityEntry[]> {
    const response = await axiosInstance.get<RecentActivityEntry[]>(`/submissions/audit/recent-activity?limit=${limit}`);
    return response.data;
  },

  /**
   * Get audit statistics for a date range (Admin only)
   */
  async getAuditStatistics(startDate?: string, endDate?: string): Promise<AuditStatistics> {
    let url = '/submissions/audit/statistics';
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axiosInstance.get<AuditStatistics>(url);
    return response.data;
  },
};