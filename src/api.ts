/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

export class ApiError extends Error {
  public status: number;
  public correlationId?: string;

  constructor(status: number, message: string, correlationId?: string) {
    super(message);
    this.status = status;
    this.correlationId = correlationId;
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}