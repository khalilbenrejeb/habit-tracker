import { db } from '../config/filedb.js';
import { logger } from '../utils/logger.js';
import { formatResponse, generateId, sanitizeUser } from '../utils/generics.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const offset = (page - 1) * limit;

    const allUsers = db.getAllUsers();
    const total = allUsers.length;
    const users = allUsers.slice(offset, offset + limit);

    logger.info('Fetched users list', { page, limit, total });

    res.json(formatResponse(true, {
      users: users.map(sanitizeUser),
      pagination: { page, limit, total }
    }, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = db.findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info('Fetched user', { userId: id });

    res.json(formatResponse(true, {
      user: sanitizeUser(user)
    }, 'User retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, role } = req.validated;

    // Check if user exists
    const existingUser = db.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const userId = generateId();
    const temporaryPassword = generateId().substring(0, 12);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newUser = db.createUser({
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    });

    logger.info('User created', { userId, email, createdBy: req.user.userId });

    res.status(201).json(formatResponse(true, {
      user: sanitizeUser(newUser),
      temporaryPassword
    }, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.validated;

    const user = db.findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = db.updateUser(id, updates);

    logger.info('User updated', { userId: id, updatedBy: req.user.userId });

    res.json(formatResponse(true, {
      user: sanitizeUser(updatedUser)
    }, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = db.findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    db.deleteUser(id);

    logger.info('User deleted', { userId: id, deletedBy: req.user.userId });

    res.json(formatResponse(true, null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};
