export const api = {
  get: async (endpoint) => {
    const response = await fetch(endpoint);
    return response.json();
  },
  post: async (endpoint, data) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  put: async (endpoint, data) => {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  delete: async (endpoint) => {
    const response = await fetch(endpoint, { method: 'DELETE' });
    return response.json();
  },
};

export default api;
