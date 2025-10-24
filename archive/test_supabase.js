// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: List storage buckets
    console.log('🪣 Test 1: Listing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
    } else {
      console.log('✅ Buckets found:', buckets.map(b => b.name).join(', '));
      console.log('');
    }

    // Test 2: Check rlp-documents bucket
    console.log('📁 Test 2: Checking rlp-documents bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('rlp-documents')
      .list('', { limit: 100 });

    if (filesError) {
      console.error('❌ Error listing files:', filesError.message);
    } else {
      console.log(`✅ Files in rlp-documents bucket: ${files.length}`);
      if (files.length > 0) {
        console.log('   Recent files:');
        files.slice(0, 5).forEach((file, i) => {
          const size = file.metadata?.size
            ? `${(file.metadata.size / 1024 / 1024).toFixed(2)} MB`
            : 'Unknown';
          console.log(`   ${i + 1}. ${file.name} (${size})`);
        });
      } else {
        console.log('   ℹ️  No files uploaded yet');
      }
      console.log('');
    }

    // Test 3: Storage statistics
    if (files && files.length > 0) {
      console.log('📊 Test 3: Storage statistics...');
      const totalSize = files.reduce((sum, file) => {
        return sum + (file.metadata?.size || 0);
      }, 0);
      console.log('✅ Statistics:');
      console.log(`   - Total files: ${files.length}`);
      console.log(`   - Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log('');
    }

    console.log('🎉 All Supabase tests completed successfully!');
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
    process.exit(1);
  }
}

testSupabase();
