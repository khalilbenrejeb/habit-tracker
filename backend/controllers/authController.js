import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { formatResponse, generateId, sanitizeUser } from '../utils/generics.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validated;

    // Get user from Supabase
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError || !users) {
      logger.warn('Login failed: User not found', { email });
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, users.password);
    if (!isPasswordValid) {
      logger.warn('Login failed: Invalid password', { email });
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: users.id,
        email: users.email,
        role: users.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info('User logged in', { userId: users.id, email });

    res.json(formatResponse(true, {
      token,
      user: sanitizeUser(users)
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.validated;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      logger.warn('Registration failed: User already exists', { email });
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId();
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user',
        createdAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('Registration failed: Database error', { error, email });
      throw error;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info('User registered', { userId: newUser.id, email });

    res.status(201).json(formatResponse(true, {
      token,
      user: sanitizeUser(newUser)
    }, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const validate = async (req, res, next) => {
  try {
    // If we reach here, the auth middleware has already verified the token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      throw new NotFoundError('User not found');
    }

    res.json(formatResponse(true, {
      user: sanitizeUser(user)
    }, 'Token is valid'));
  } catch (error) {
    next(error);
  }
};
