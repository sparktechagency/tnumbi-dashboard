import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const baseUrl = 'http://10.10.7.41:5000/api/v1';
// export const imageUrl = 'http://10.10.7.41:5000';
export const baseUrl = 'https://api.mamacaresitters.com/api/v1';
export const imageUrl = 'https://api.mamacaresitters.com';

// Centralized base query with automatic token authorization
export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Common API types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  data: {
    success: boolean;
    message: string;
    errors?: any;
  };
}
