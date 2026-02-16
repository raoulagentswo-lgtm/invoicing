/**
 * Database Connection Module
 * 
 * Initializes and manages the Knex database connection for PostgreSQL
 */

import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL, NODE_ENV } = process.env;

const config = {
  client: 'postgresql',
  connection: DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'facturation_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    database: process.env.DB_NAME || 'facturation'
  },
  pool: {
    min: 2,
    max: NODE_ENV === 'production' ? 10 : 5
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'js'
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'js'
  },
  useNullAsDefault: false
};

const db = knex(config);

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

export default db;
