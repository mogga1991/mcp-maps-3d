import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { processPDF } from '../services/pdfProcessor.js';
import { supabase } from '../config/supabase.js';
import { sql } from '../config/database.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/rlp/upload
 * Upload and process an RLP PDF document
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📤 Received file: ${req.file.originalname} (${req.file.size} bytes)`);

    const filePath = req.file.path;
    const filename = req.file.filename;
    const originalFilename = req.file.originalname;

    // Step 1: Process PDF with Gemini
    const { extractedText, requirements } = await processPDF(filePath);

    // Step 2: Upload to Supabase Storage (if configured)
    let storageUrl = null;
    if (supabase) {
      try {
        const fileBuffer = await fs.readFile(filePath);
        const { data, error } = await supabase.storage
          .from('rlp-documents')
          .upload(filename, fileBuffer, {
            contentType: 'application/pdf',
            cacheControl: '3600'
          });

        if (error) throw error;
        storageUrl = data.path;
        console.log(`☁️  Uploaded to Supabase: ${storageUrl}`);
      } catch (error) {
        console.warn('⚠️  Supabase upload failed:', error.message);
      }
    }

    // Step 3: Save to database (if configured)
    let documentId = null;
    if (sql) {
      try {
        const result = await sql`
          INSERT INTO rlp_documents (
            filename,
            original_filename,
            file_size,
            storage_url,
            extracted_text,
            requirements,
            status
          ) VALUES (
            ${filename},
            ${originalFilename},
            ${req.file.size},
            ${storageUrl},
            ${extractedText},
            ${JSON.stringify(requirements)},
            'processed'
          )
          RETURNING id
        `;
        documentId = result[0].id;
        console.log(`💾 Saved to database with ID: ${documentId}`);
      } catch (error) {
        console.warn('⚠️  Database save failed:', error.message);
      }
    }

    // Step 4: Clean up local file
    try {
      await fs.unlink(filePath);
      console.log(`🗑️  Cleaned up local file: ${filename}`);
    } catch (error) {
      console.warn('⚠️  Could not delete local file:', error.message);
    }

    // Step 5: Return response
    res.json({
      success: true,
      message: 'RLP document processed successfully',
      data: {
        documentId,
        filename: originalFilename,
        requirements,
        extractedText: extractedText.substring(0, 500) + '...', // Preview only
        storageUrl
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);

    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process RLP document',
      message: error.message
    });
  }
});

/**
 * GET /api/rlp/:id
 * Get a specific RLP document by ID
 */
router.get('/:id', async (req, res) => {
  try {
    if (!sql) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const documentId = parseInt(req.params.id);
    const result = await sql`
      SELECT * FROM rlp_documents WHERE id = ${documentId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('❌ Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document',
      message: error.message
    });
  }
});

/**
 * GET /api/rlp
 * List all RLP documents
 */
router.get('/', async (req, res) => {
  try {
    if (!sql) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const result = await sql`
      SELECT id, original_filename, file_size, status, created_at
      FROM rlp_documents
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ List documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list documents',
      message: error.message
    });
  }
});

export default router;
