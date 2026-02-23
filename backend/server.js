import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { authMiddleware, optionalAuth } from './middleware/auth.js';
import { loggingMiddleware, errorLoggingMiddleware } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import supabase from './supabaseclient.js'; // default import now

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(errorLoggingMiddleware);


// Routes
app.use('/api', routes);
// test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is alive 🔥' });
});

// route to get habits
app.get('/api/habits', async (req, res) => {
  try {
    const { data, error } = await supabase.from('habits').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});






// get all admin users
app.get('/api/adminusers', async (req, res) => {
  const { data, error } = await supabase.from('adminuser').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// add feedback
app.post('/api/adminfeedbacks', async (req, res) => {
  const { email, msgfeedback } = req.body  // <-- lowercase here
  const { data, error } = await supabase
    .from('adminfeedbacks')
    .insert([{ email, msgfeedback }])  // <-- lowercase here
  if (error) return res.status(500).json({ error })
  res.json(data)
})

// get habits
app.get('/api/habits', async (req, res) => {
  const { data, error } = await supabase.from('habits').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// add habit
app.post('/api/habits', async (req, res) => {
  const { habit_name, habit_type } = req.body;
  const { data, error } = await supabase.from('habits').insert([{ habit_name, habit_type }]);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// count admin users
app.get('/api/adminusers/count', async (req, res) => {
  const { count, error } = await supabase
    .from('adminuser')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error });
  res.json({ count });
});

// count habits
app.get('/api/habits/count', async (req, res) => {
  const { count, error } = await supabase
    .from('habits')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error });
  res.json({ count });
});

app.get('/api/adminfeedbacks', async (req, res) => {
  const { data, error } = await supabase.from('adminfeedbacks').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get('/api/adminfeedbacks/count', async (req, res) => {
  const { count, error } = await supabase
    .from('adminfeedbacks')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error });
  res.json({ count });
});
app.get('/api/users', optionalAuth, async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get('/api/users/count', optionalAuth, async (req, res) => {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error });
  res.json({ count });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;