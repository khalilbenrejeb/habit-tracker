# ISS396 Backend API

A comprehensive REST API built with Express.js, Supabase, and JWT authentication.

## Features

- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, User, Moderator)
- ✅ Supabase PostgreSQL database integration
- ✅ Input validation with Zod
- ✅ Comprehensive error handling
- ✅ Request/error logging
- ✅ CRUD operations for Users and Projects
- ✅ Async error handling
- ✅ CORS enabled

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

**Important:** Replace `YOUR_PASSWORD_HERE` with your actual Supabase database password.

```env
SUPABASE_URL=https://tfunpfqsonkbswauuqyd.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_DxO0sA42OHQHxQ0qMEI_Sw_7p_UNIMr
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.tfunpfqsonkbswauuqyd.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=3001
NODE_ENV=development
```

### 3. Set Up Database

Create these tables in your Supabase:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('active', 'archived', 'draft')),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### 4. Run Server

**Development (with hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  },
  "message": "Registration successful",
  "timestamp": "2026-02-12T..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Validate Token
```http
GET /auth/validate
Authorization: Bearer YOUR_TOKEN
```

### User Endpoints (Admin Only)

#### Get All Users
```http
GET /users?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer YOUR_TOKEN
```

#### Create User (Admin)
```http
POST /users
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "user"
}
```

**Response includes temporary password**

#### Update User (Admin)
```http
PUT /users/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "role": "moderator"
}
```

#### Delete User (Admin)
```http
DELETE /users/:id
Authorization: Bearer YOUR_TOKEN
```

### Project Endpoints (Authenticated Users)

#### Get All Projects
```http
GET /projects?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

#### Get Project by ID
```http
GET /projects/:id
Authorization: Bearer YOUR_TOKEN
```

#### Create Project
```http
POST /projects
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "status": "draft"
}
```

Status options: `draft`, `active`, `archived`

#### Update Project
```http
PUT /projects/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Project Name",
  "status": "active"
}
```

#### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer YOUR_TOKEN
```

### Health Check

```http
GET /health
```

## Middleware

### Authentication (`authMiddleware`)
- Verifies JWT token from `Authorization` header
- Decodes and attaches user info to `req.user`
- Required for protected routes

### Authorization (`requireRole`)
- Checks if user has required role
- Available: `onlyAdmin`, `onlyModerator`, `onlyUser`
- Use: `router.post('/route', onlyAdmin, controller)`

### Validation (`validate`, `validateQuery`)
- Validates request body/query with Zod schemas
- Attaches validated data to `req.validated`
- Returns 400 on validation failure

### Logging (`loggingMiddleware`)
- Logs all HTTP requests with response time
- Logs errors with full context
- Writes to `logs/` directory

### Error Handling
- Centralized error handler
- Custom error classes (ValidationError, AuthenticationError, etc.)
- Consistent error response format

## Project Structure

```
backend/
├── config/              # Database configuration
├── controllers/         # Business logic
├── middleware/          # Express middleware
├── routes/              # API route definitions
├── utils/               # Helper functions & error classes
├── validators/          # Zod schemas & validation
├── logs/                # Application logs
├── index.js             # Main server file
├── package.json         # Dependencies
└── .env.example         # Environment template
```

## Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "timestamp": "2026-02-12T..."
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (Missing/Invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Resource already exists)
- `500` - Internal Server Error

## Logging

Logs are stored in `logs/` directory:
- `app.log` - General application logs
- `error.log` - Error logs only

Each log entry includes:
- Timestamp
- Log level (INFO, ERROR, WARN, DEBUG)
- Message
- Additional context (userId, duration, etc.)

## Security Notes

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secret**: Change `JWT_SECRET` in production
3. **Password Hashing**: Uses bcrypt with 10 rounds
4. **CORS**: Configure `cors()` for production domains
5. **Rate Limiting**: Consider adding rate limiting middleware for production
6. **HTTPS**: Use HTTPS in production

## Future Enhancements

- [ ] Rate limiting
- [ ] Request caching
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Input sanitization
- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] Refresh token rotation
- [ ] Audit logging
- [ ] Database migrations
- [ ] Unit/integration tests

## Support

For issues or questions, check:
1. Logs in `logs/` directory
2. Supabase dashboard for database issues
3. Environment variables configuration
