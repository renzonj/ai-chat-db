import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schemas';
import { Pool } from 'pg';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

// Create a new PostgreSQL connection pool
const queryClient = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle({ client: queryClient, schema });

// Add a function to close the pool when the application is shutting down
export const closeConnection = async () => {
  await queryClient.end();
  console.log('Database pool has been closed');
};

export default db;
