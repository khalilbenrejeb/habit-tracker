# Frontend-Backend Integration Guide

This guide explains how to use the API integration in your Next.js frontend.

## Setup

### Environment Variables

Create a `.env.local` file in the `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

This is already created for you!

### AuthProvider Setup

The `AuthProvider` is already wrapped in your root layout (`app/layout.tsx`), so authentication context is available throughout your app.

## Usage

### 1. Using Auth Hooks

```tsx
'use client'

import { useAuth, useLogin } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  const { handleLogin, error, isLoading } = useLogin()

  if (!isAuthenticated) {
    return <div>Please login</div>
  }

  return (
    <div>
      Welcome, {user?.firstName} {user?.lastName}
    </div>
  )
}
```

### 2. Using Project Hooks

```tsx
'use client'

import { useProjects } from '@/hooks/useProjects'
import { useEffect } from 'react'

export default function ProjectsList() {
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    deleteProject
  } = useProjects()

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = async () => {
    try {
      await createProject({
        name: 'New Project',
        description: 'My new project',
        status: 'draft'
      })
    } catch (err) {
      console.error('Failed to create project')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <button onClick={() => deleteProject(project.id)}>Delete</button>
        </div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  )
}
```

### 3. Using User Hooks (Admin Only)

```tsx
'use client'

import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export default function UsersList() {
  const { user } = useAuth()
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    deleteUser
  } = useUsers()

  // Only admins can see this
  if (user?.role !== 'admin') {
    return <div>Access denied</div>
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <span>{user.firstName} {user.lastName}</span>
          <span>{user.role}</span>
        </div>
      ))}
    </div>
  )
}
```

## Available Hooks

### `useAuth()`
- `user: User | null` - Current user object
- `token: string | null` - JWT token
- `isLoading: boolean` - Loading state
- `isAuthenticated: boolean` - Is user authenticated
- `login(email, password)` - Login user
- `register(email, password, firstName, lastName)` - Register new user
- `logout()` - Logout user
- `validateToken()` - Validate current token

### `useLogin()` & `useRegister()`
- `handleLogin(email, password)` - Login function
- `handleRegister(email, password, firstName, lastName)` - Register function
- `error: string | null` - Error message
- `isLoading: boolean` - Loading state

### `useLogout()`
- `logout()` - Clear auth state and logout

### `useProjects()`
- `projects: Project[]` - List of projects
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `pagination: {...}` - Pagination info
- `fetchProjects(page?, limit?)` - Get projects
- `getProject(id)` - Get single project
- `createProject(data)` - Create project
- `updateProject(id, data)` - Update project
- `deleteProject(id)` - Delete project

### `useUsers()` (Admin only)
- `users: User[]` - List of users
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `pagination: {...}` - Pagination info
- `fetchUsers(page?, limit?)` - Get all users
- `getUser(id)` - Get single user
- `createUser(data)` - Create user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user

## API Client

For direct API calls, use the `apiClient`:

```tsx
import { apiClient } from '@/lib/api/client'

// GET request
const response = await apiClient.get('/auth/validate')

// POST request
const response = await apiClient.post('/projects', {
  name: 'My Project'
})

// DELETE request
await apiClient.delete('/projects/123')
```

## Protected Routes

To protect routes, check authentication in your component:

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null

  return <div>Protected content</div>
}
```

## Error Handling

All hooks include error handling:

```tsx
const { error, handleLogin } = useLogin()

useEffect(() => {
  if (error) {
    console.error('Login error:', error)
    // Show error to user
  }
}, [error])
```

## Token Management

Tokens are automatically:
- Stored in localStorage when logged in
- Retrieved on page load
- Attached to all API requests
- Cleared on logout

## Testing the Integration

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Go to http://localhost:3000/login

4. Use your Supabase user to login

5. You should be redirected to the dashboard with auth context available

## Troubleshooting

**"CORS error"**
- Make sure backend is running on port 3001
- Check .env.local has correct API_URL

**"Token not found"**
- Check localStorage in browser DevTools
- Try logging in again

**"User not authorized"**
- Check user role matches the required role
- Admin pages require `role: 'admin'`

**"Backend connection refused"**
- Verify backend is running: `npm run dev` in backend folder
- Check port 3001 is available
