export class ApiError extends Error {
  constructor(status, message) {
    if (status < 0) {
      throw new Error('Invalid status code');
    }
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
