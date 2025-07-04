import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;

async function main() {
  const dbClient = postgres(connectionString, { max: 1 });
  const db = drizzle(dbClient);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('Migrations finished.');

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 