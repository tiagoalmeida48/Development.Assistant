export interface ResultApi<T = unknown> {
  success: boolean;
  message?: string;
  result?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError extends Error {
  response?: {
    data: ResultApi;
    status: number;
    statusText: string;
  };
  errors?: Record<string, string[]>;
  statusCode?: number;
}
