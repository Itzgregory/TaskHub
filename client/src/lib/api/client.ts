/**
 * Base API client for TaskHub backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5078/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const correlationId = crypto.randomUUID();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
        ...options.headers,
      },
      // important for session cookies...unifiedbeez issue with igee
      credentials: 'include', 
    };

    try {
      const response = await fetch(url, config);
      // so i encountered an issue where my hooks were running into errors when the response body was empty
      // so what i am doing here is that instead of just doing await response.json(), i am doing await response.text, so i satisfy empty 204 response bodies.
      // why i didnt fix from the backend was because there would be no meaningful data to return here, and returning no content was correct
      // i could have also tried to return {sucess: true} with 200 status code, but then that would be a wrong solution since i will be bending REST semantics just to appease the client
      const text = await response.text();
      const data: ApiResponse<T> = text ? await JSON.parse(text) : { success: true };

      if (!response.ok || !data.success) {
        const error: ApiError = {
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Please check your connection.',
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
