/**
 * API Client for Render Backend
 * Handles communication between Cloudflare Pages frontend and Render backend
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://elevateforhumanity.onrender.com';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/api/health');
  }

  // User endpoints
  async getUser(userId) {
    return this.request(`/api/users/${userId}`);
  }

  // Course endpoints
  async getCourses() {
    return this.request('/api/courses');
  }

  async getCourse(courseId) {
    return this.request(`/api/courses/${courseId}`);
  }

  // Program endpoints
  async getPrograms() {
    return this.request('/api/programs');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
