import { DatabaseUser } from '../types/User';

const API_BASE_URL = 'http://3.81.44.175:3000';

export const userService = {
  async getAllUsers(): Promise<DatabaseUser[]> {
    const response = await fetch(`${API_BASE_URL}/users/all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};