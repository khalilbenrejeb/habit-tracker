import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { formatResponse, generateId } from '../utils/generics.js';
import { NotFoundError } from '../utils/errors.js';

export const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const offset = (page - 1) * limit;

    const { data: projects, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('userId', req.user.userId)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    logger.info('Fetched projects', { userId: req.user.userId, page, limit });

    res.json(formatResponse(true, {
      projects,
      pagination: { page, limit, total: count }
    }, 'Projects retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) {
      throw new NotFoundError('Project not found');
    }

    // Check ownership
    if (project.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new NotFoundError('Project not found');
    }

    logger.info('Fetched project', { projectId: id, userId: req.user.userId });

    res.json(formatResponse(true, { project }, 'Project retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.validated;
    const projectId = generateId();

    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        userId: req.user.userId,
        name,
        description,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('Project created', { projectId, userId: req.user.userId });

    res.status(201).json(formatResponse(true, { project: newProject }, 'Project created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.validated;

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      throw new NotFoundError('Project not found');
    }

    // Check ownership
    if (project.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new NotFoundError('Project not found');
    }

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Project updated', { projectId: id, userId: req.user.userId });

    res.json(formatResponse(true, { project: updatedProject }, 'Project updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      throw new NotFoundError('Project not found');
    }

    // Check ownership
    if (project.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new NotFoundError('Project not found');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('Project deleted', { projectId: id, userId: req.user.userId });

    res.json(formatResponse(true, null, 'Project deleted successfully'));
  } catch (error) {
    next(error);
  }
};
