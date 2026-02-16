import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL } = process.env;

export default {
  development: {
    client: 'postgresql',
    connection: DATABASE_URL || 'postgresql://facturation_user:secure_password@localhost:5432/facturation',
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: DATABASE_URL,
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
