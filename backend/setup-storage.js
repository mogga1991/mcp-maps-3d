import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupStorage() {
  try {
    console.log('🔧 Setting up Supabase Storage...');

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(b => b.name === 'rlp-documents');

    if (bucketExists) {
      console.log('✅ Bucket "rlp-documents" already exists');
    } else {
      console.log('📦 Creating bucket "rlp-documents"...');

      const { data, error } = await supabase.storage.createBucket('rlp-documents', {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['application/pdf']
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
      } else {
        console.log('✅ Bucket "rlp-documents" created successfully');
      }
    }

    console.log('\n📋 Current buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupStorage();
