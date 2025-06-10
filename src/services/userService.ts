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
  }
};