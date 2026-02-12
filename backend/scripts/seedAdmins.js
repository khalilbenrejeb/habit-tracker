import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../config/filedb.js';
import { generateId } from '../utils/generics.js';
import { logger } from '../utils/logger.js';

const ADMINS = [
  {
    email: 'khalil.benrejeb@medtech.tn',
    password: 'mouradchess',
    firstName: 'Khalil',
    lastName: 'Benrejeb'
  },
  {
    email: 'mouradmalki@medtech.tn',
    password: 'mouradchess',
    firstName: 'Mourad',
    lastName: 'Malki'
  }
];

async function seedAdmins() {
  try {
    logger.info('Starting admin seed...');

    for (const admin of ADMINS) {
      try {
        // Check if user already exists
        const existingUser = db.findUserByEmail(admin.email);

        if (existingUser) {
          logger.warn(`User already exists: ${admin.email}`, {
            userId: existingUser.id
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        const userId = generateId();

        // Create admin user
        const newUser = db.createUser({
          id: userId,
          email: admin.email,
          password: hashedPassword,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: 'admin'
        });

        logger.info(`✓ Admin created`, {
          email: admin.email,
          userId: newUser.id,
          role: 'admin'
        });
      } catch (error) {
        logger.error(`Error creating admin ${admin.email}`, {
          error: error.message
        });
      }
    }

    logger.info('✓ Admin seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Admin seed failed', { error: error.message });
    process.exit(1);
  }
}

seedAdmins();
