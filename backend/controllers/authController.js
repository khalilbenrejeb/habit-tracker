import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/filedb.js';
import { logger } from '../utils/logger.js';
import { formatResponse, generateId, sanitizeUser } from '../utils/generics.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validated;

    // Get user from file database
    const user = db.findUserByEmail(email);

    if (!user) {
      logger.warn('Login failed: User not found', { email });
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login failed: Invalid password', { email });
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info('User logged in', { userId: user.id, email });

    res.json(formatResponse(true, {
      token,
      user: sanitizeUser(user)
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.validated;

    // Check if user exists
    const existingUser = db.findUserByEmail(email);

    if (existingUser) {
      logger.warn('Registration failed: User already exists', { email });
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    // Create user
    const newUser = db.createUser({
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user'
    });

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
    const user = db.findUserById(req.user.userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json(formatResponse(true, {
      user: sanitizeUser(user)
    }, 'Token is valid'));
  } catch (error) {
    next(error);
  }
};
