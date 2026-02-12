import { apiClient, ApiResponse } from './client';

// Auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  validate: () =>
    apiClient.get<{ user: User }>('/auth/validate'),
};

// User endpoints
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'moderator';
}

export const userApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get<{
      users: User[];
      pagination: { page: number; limit: number; total: number };
    }>(`/users?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    apiClient.get<{ user: User }>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    apiClient.post<{ user: User; temporaryPassword: string }>('/users', data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<{ user: User }>(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
};

// Project endpoints
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
}

export const projectApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get<{
      projects: Project[];
      pagination: { page: number; limit: number; total: number };
    }>(`/projects?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    apiClient.get<{ project: Project }>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    apiClient.post<{ project: Project }>('/projects', data),

  update: (id: string, data: UpdateProjectRequest) =>
    apiClient.put<{ project: Project }>(`/projects/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),
};

export default {
  auth: authApi,
  users: userApi,
  projects: projectApi,
};
