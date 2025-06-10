import { DatabaseUser, Submission } from '../types/User';

const API_BASE_URL = 'http://localhost:3000';

export const userService = {
  async getAllUsers(): Promise<DatabaseUser[]> {
    const response = await fetch(`${API_BASE_URL}/users/all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async getUserById(id: string): Promise<DatabaseUser> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async fetchUserSubmissionById(id: String): Promise<Submission> {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  // Add these methods to userService
  async approveSubmission(id: string): Promise<Submission> {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async rejectSubmission(id: string, reason?: string): Promise<Submission> {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};