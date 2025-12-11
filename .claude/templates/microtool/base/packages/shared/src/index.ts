// Shared types and utilities

export interface Item {
  id: number;
  title: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Utility functions
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}
