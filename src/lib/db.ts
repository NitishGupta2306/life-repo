import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "../../database/simple-schema";

// Enhanced PostgreSQL client configuration with optimizations
const client = postgres(env.DATABASE_URL, {
  // Connection pool settings
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  
  // Performance optimizations
  prepare: false, // Disable prepared statements for better performance with connection pooling
  
  // Error handling
  onnotice: (notice) => {
    console.log('PostgreSQL notice:', notice);
  },
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  
  // Transform column names from snake_case to camelCase
  transform: postgres.camel,
  
  // Connection retry configuration
  connection: {
    application_name: 'life-rpg-app',
  },
});

// Create Drizzle database instance with enhanced configuration
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Database error types for better error handling
export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, identifier?: string) {
    super(`${resource}${identifier ? ` with id ${identifier}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

// Database operation wrapper with error handling
export async function withDatabase<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Database operation failed${errorContext ? ` (${errorContext})` : ''}:`, error);
    
    // Categorize and re-throw appropriate errors
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        throw new DatabaseError('Database connection failed', error);
      }
      if (error.message.includes('timeout')) {
        throw new DatabaseError('Database operation timeout', error);
      }
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        throw new ValidationError('Duplicate record found');
      }
      if (error.message.includes('not found') || error.message.includes('no rows')) {
        throw new NotFoundError('Resource');
      }
    }
    
    throw new DatabaseError('Database operation failed', error as Error);
  }
}

// Enhanced query logging for development
if (process.env.NODE_ENV === 'development') {
  const originalQuery = client.query;
  client.query = function(...args) {
    const start = Date.now();
    return originalQuery.apply(this, args).finally(() => {
      const duration = Date.now() - start;
      if (duration > 100) { // Log slow queries (>100ms)
        console.warn(`Slow query detected (${duration}ms):`, args[0]);
      }
    });
  };
}