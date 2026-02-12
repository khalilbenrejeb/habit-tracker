# Backend Setup Instructions

## Prerequisites

1. **Node.js** installed
2. **Supabase account** with database credentials
3. **Environment variables** configured in `.env`

## Environment Setup

1. Create a `.env` file in the backend folder (already done):

```env
SUPABASE_URL=https://tfunpfqsonkbswauuqyd.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_DxO0sA42OHQHxQ0qMEI_Sw_7p_UNIMr
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.tfunpfqsonkbswauuqyd.supabase.co:5432/postgres
JWT_SECRET=dev-secret-key-change-in-production
PORT=3001
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your Supabase database password.

## Database Setup

### 1. Create Tables in Supabase

Copy and run these SQL queries in your Supabase SQL Editor:

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

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
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

-- Create index for user projects
CREATE INDEX idx_projects_userId ON projects(userId);
```

### 2. Create Admin Users

Run the seed script to create admin users:

```bash
npm run seed:admins
```

This will create two admin users:
- **Email:** khalil.benrejeb@medtech.tn
- **Email:** mouradmalki@medtech.tn
- **Password:** mouradchess (for both)

The script will:
- Check if users already exist (won't duplicate)
- Hash the passwords with bcrypt
- Set role to 'admin'
- Log all operations

## Installation & Running

### Install Dependencies
```bash
npm install
```

### Development (with hot reload)
```bash
npm run dev
```

Server runs on: `http://localhost:3001`

### Production
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication
```
POST /auth/login
POST /auth/register
GET /auth/validate
```

### Users (Admin only)
```
GET /users                 # List all users
POST /users               # Create user
GET /users/:id            # Get user by ID
PUT /users/:id            # Update user
DELETE /users/:id         # Delete user
```

### Projects (Authenticated)
```
GET /projects             # List user's projects
POST /projects            # Create project
GET /projects/:id         # Get project
PUT /projects/:id         # Update project
DELETE /projects/:id      # Delete project
```

## Testing

### Login with Admin Account
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"khalil.benrejeb@medtech.tn","password":"mouradchess"}'
```

You'll get a response with a JWT token:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "email": "khalil.benrejeb@medtech.tn",
      "firstName": "Khalil",
      "lastName": "Benrejeb",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

### Use Token for Protected Routes
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Logs

Logs are saved in the `logs/` directory:
- `logs/app.log` - General application logs
- `logs/error.log` - Error logs only

Check these files for debugging.

## Troubleshooting

### "Supabase connection error"
- Verify credentials in `.env`
- Check Supabase project is active
- Ensure database password is correct

### "CORS errors in frontend"
- Backend should be running on port 3001
- Frontend should have correct API_URL in `.env.local`

### "Seeds already exist"
- Script checks for duplicates automatically
- Safe to run multiple times

### Port already in use
```bash
# Find process using port 3001 and kill it
lsof -ti:3001 | xargs kill -9  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process  # Windows
```

## Security Notes

1. **Change JWT_SECRET in production** - Use a strong random string
2. **Use HTTPS in production** - Never send tokens over HTTP
3. **Database Password** - Store securely, never commit to git
4. **CORS** - Configure allowed origins for production
5. **Rate Limiting** - Consider adding for production
6. **Password Policy** - Current: 8+ characters minimum

## Development Tips

- **Hot reload:** Code changes auto-reload with `npm run dev`
- **Debug mode:** Set `NODE_ENV=development` for stack traces
- **Log level:** Add more logging in middleware/controllers as needed
- **Test routes:** Use Postman or curl for quick testing

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up Supabase tables (SQL queries above)
3. ✅ Create admin users: `npm run seed:admins`
4. ✅ Start server: `npm run dev`
5. ✅ Test login with admin credentials
6. ✅ Connect frontend to backend

## Support

Check the backend README.md for more API documentation.
