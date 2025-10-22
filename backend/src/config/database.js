import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not configured. Using in-memory storage for now.');
}

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Initialize database schema
export async function initDatabase() {
  if (!sql) {
    console.log('📦 Running in development mode without database');
    return;
  }

  try {
    console.log('🔧 Initializing database schema...');

    // Create rlp_documents table
    await sql`
      CREATE TABLE IF NOT EXISTS rlp_documents (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_size BIGINT,
        storage_url TEXT,
        extracted_text TEXT,
        requirements JSONB,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create text_chunks table (for RAG - Phase 2)
    await sql`
      CREATE TABLE IF NOT EXISTS text_chunks (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES rlp_documents(id) ON DELETE CASCADE,
        chunk_text TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        page_number INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
