// src/services/userService.ts
import { DatabaseUser, Submission } from '../types/User';
import axiosInstance from '../api/axiosInstance'; // Import the axios instance

// No need for API_BASE_URL here anymore if using axiosInstance.baseURL
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const userService = {
  // Use axiosInstance directly
  async getAllUsers(): Promise<DatabaseUser[]> {
    const response = await axiosInstance.get<DatabaseUser[]>('/users/all'); // Axios's .get() method
    return response.data; // Axios wraps the response data in a 'data' property
  },

  async getUserById(id: string): Promise<DatabaseUser> {
    const response = await axiosInstance.get<DatabaseUser>(`/users/${id}`);
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
};