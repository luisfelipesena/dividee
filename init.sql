-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for our application
CREATE SCHEMA IF NOT EXISTS dividee;

-- Set default search path
ALTER DATABASE dividee SET search_path TO dividee, public; 