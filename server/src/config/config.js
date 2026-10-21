/**
 * Application Configuration
 * Centralized environment configuration with fallback defaults.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'health_consultation_secret_key_2026',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../health_platform.db'),
};
