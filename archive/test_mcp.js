// Quick test script to verify Neon database connection
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testDatabase() {
  console.log('🔍 Testing Neon Database Connection...\n');

  try {
    // Test 1: List all tables
    console.log('📋 Test 1: Listing all tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('✅ Tables found:', tables.map(t => t.table_name).join(', '));
    console.log('');

    // Test 2: Get rlp_documents schema
    console.log('📊 Test 2: Getting rlp_documents table schema...');
    const schema = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'rlp_documents'
      ORDER BY ordinal_position
    `;
    console.log('✅ rlp_documents columns:');
    schema.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
    });
    console.log('');

    // Test 3: Count documents
    console.log('📈 Test 3: Counting RLP documents...');
    const count = await sql`SELECT COUNT(*) as count FROM rlp_documents`;
    console.log(`✅ Total RLP documents: ${count[0].count}`);
    console.log('');

    // Test 4: Get recent documents
    console.log('📄 Test 4: Getting 5 most recent documents...');
    const recent = await sql`
      SELECT
        id,
        original_filename,
        file_size,
        status,
        created_at
      FROM rlp_documents
      ORDER BY created_at DESC
      LIMIT 5
    `;
    if (recent.length > 0) {
      console.log('✅ Recent documents:');
      recent.forEach((doc, i) => {
        const size = doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
        console.log(`   ${i + 1}. ${doc.original_filename} (${size}) - ${doc.status}`);
      });
    } else {
      console.log('ℹ️  No documents found in database yet');
    }
    console.log('');

    // Test 5: Database statistics
    console.log('📊 Test 5: Database statistics...');
    const stats = await sql`
      SELECT
        COUNT(*) as total_docs,
        SUM(file_size) as total_size,
        COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM rlp_documents
    `;
    const totalSize = stats[0].total_size ? `${(stats[0].total_size / 1024 / 1024).toFixed(2)} MB` : '0 MB';
    console.log('✅ Statistics:');
    console.log(`   - Total documents: ${stats[0].total_docs}`);
    console.log(`   - Total storage: ${totalSize}`);
    console.log(`   - Processed: ${stats[0].processed}`);
    console.log(`   - Pending: ${stats[0].pending}`);
    console.log('');

    console.log('🎉 All database tests completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
