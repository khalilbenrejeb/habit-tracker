import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(PROJECTS_FILE)) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2));
}

class Database {
  // ===== Users =====
  readUsers() {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }

  findUserByEmail(email) {
    const users = this.readUsers();
    return users.find(u => u.email === email);
  }

  findUserById(id) {
    const users = this.readUsers();
    return users.find(u => u.id === id);
  }

  getAllUsers() {
    return this.readUsers();
  }

  createUser(userData) {
    const users = this.readUsers();
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.writeUsers(users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.readUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.writeUsers(users);
    return users[index];
  }

  deleteUser(id) {
    const users = this.readUsers();
    const filtered = users.filter(u => u.id !== id);
    this.writeUsers(filtered);
  }

  // ===== Projects =====
  readProjects() {
    try {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  writeProjects(projects) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  }

  findProjectById(id) {
    const projects = this.readProjects();
    return projects.find(p => p.id === id);
  }

  getUserProjects(userId) {
    const projects = this.readProjects();
    return projects.filter(p => p.userId === userId);
  }

  getAllProjects() {
    return this.readProjects();
  }

  createProject(projectData) {
    const projects = this.readProjects();
    const newProject = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    this.writeProjects(projects);
    return newProject;
  }

  updateProject(id, updates) {
    const projects = this.readProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.writeProjects(projects);
    return projects[index];
  }

  deleteProject(id) {
    const projects = this.readProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.writeProjects(filtered);
  }
}

export const db = new Database();
