import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'dividee_user',
    password: process.env.DB_PASSWORD || 'dividee_password',
    database: process.env.DB_NAME || 'dividee',
  },
  verbose: true,
  strict: true,
}); 