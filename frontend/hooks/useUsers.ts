'use client';

import { useState, useCallback } from 'react';
import { userApi, User, CreateUserRequest, UpdateUserRequest } from '@/lib/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getAll(page, limit);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getById(id);
      return response.data.user;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.create(data);
      setUsers((prev) => [response.data.user, ...prev]);
      return { user: response.data.user, temporaryPassword: response.data.temporaryPassword };
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.update(id, data);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? response.data.user : u))
      );
      return response.data.user;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await userApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
}
