import { db } from '../config/filedb.js';
import { logger } from '../utils/logger.js';
import { formatResponse, generateId } from '../utils/generics.js';
import { NotFoundError } from '../utils/errors.js';

export const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const offset = (page - 1) * limit;

    const allProjects = db.getUserProjects(req.user.userId);
    const total = allProjects.length;
    const projects = allProjects.slice(offset, offset + limit);

    logger.info('Fetched projects', { userId: req.user.userId, page, limit });

    res.json(formatResponse(true, {
      projects,
      pagination: { page, limit, total }
    }, 'Projects retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = db.findProjectById(id);

    if (!project) {
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

    const newProject = db.createProject({
      id: projectId,
      userId: req.user.userId,
      name,
      description,
      status
    });

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

    const project = db.findProjectById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check ownership
    if (project.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new NotFoundError('Project not found');
    }

    const updatedProject = db.updateProject(id, updates);

    logger.info('Project updated', { projectId: id, userId: req.user.userId });

    res.json(formatResponse(true, { project: updatedProject }, 'Project updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = db.findProjectById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check ownership
    if (project.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new NotFoundError('Project not found');
    }

    db.deleteProject(id);

    logger.info('Project deleted', { projectId: id, userId: req.user.userId });

    res.json(formatResponse(true, null, 'Project deleted successfully'));
  } catch (error) {
    next(error);
  }
};
