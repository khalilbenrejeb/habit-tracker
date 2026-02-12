'use client';

import { useState, useCallback } from 'react';
import { projectApi, Project, CreateProjectRequest, UpdateProjectRequest } from '@/lib/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchProjects = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectApi.getAll(page, limit);
      setProjects(response.data.projects);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectApi.getById(id);
      return response.data.project;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectApi.create(data);
      setProjects((prev) => [response.data.project, ...prev]);
      return response.data.project;
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectApi.update(id, data);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? response.data.project : p))
      );
      return response.data.project;
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    pagination,
    fetchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
}
