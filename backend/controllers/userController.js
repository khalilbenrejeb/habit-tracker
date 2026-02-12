import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { formatResponse, generateId, sanitizeUser } from '../utils/generics.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const offset = (page - 1) * limit;

    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    logger.info('Fetched users list', { page, limit, total: count });

    res.json(formatResponse(true, {
      users: users.map(sanitizeUser),
      pagination: { page, limit, total: count }
    }, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const userId = generateId();
    const temporaryPassword = generateId().substring(0, 12);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

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

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      throw new NotFoundError('User not found');
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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

    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      throw new NotFoundError('User not found');
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('User deleted', { userId: id, deletedBy: req.user.userId });

    res.json(formatResponse(true, null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};
