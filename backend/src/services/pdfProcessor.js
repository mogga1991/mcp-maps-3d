import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Process a PDF file using Gemini's multimodal capabilities
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{extractedText: string, requirements: object}>}
 */
export async function processPDF(filePath) {
  try {
    console.log(`📄 Processing PDF: ${filePath}`);

    // Read the PDF file as base64
    const pdfBuffer = await fs.readFile(filePath);
    const base64PDF = pdfBuffer.toString('base64');

    // Use Gemini to extract and analyze the PDF
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert at analyzing RLP (Request for Lease Proposals) documents for government real estate requirements.

Please analyze this RLP document and extract the following information in a structured format:

1. **Location Requirements**: City, state, region, specific areas mentioned
2. **Space Type**: Office, warehouse, retail, etc.
3. **Square Footage**: Minimum and maximum size requirements
4. **Parking**: Number of spaces required
5. **Lease Term**: Duration of lease
6. **Budget/Price Range**: If mentioned
7. **Key Deadlines**: Submission deadlines, move-in dates
8. **Special Requirements**: Accessibility, security clearances, specific amenities
9. **Contact Information**: Agency contact, submission address

Provide your response in JSON format with these exact keys:
{
  "location": "...",
  "spaceType": "...",
  "squareFootage": { "min": number, "max": number },
  "parking": number,
  "leaseTerm": "...",
  "budget": "...",
  "deadlines": [...],
  "specialRequirements": [...],
  "contactInfo": "...",
  "summary": "A brief 2-3 sentence summary of the RLP"
}

Also provide the full extracted text separately.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: base64PDF,
          mimeType: 'application/pdf'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('✅ PDF processed successfully');

    // Try to extract JSON from the response
    let requirements = {};
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        requirements = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('⚠️  Could not parse JSON from response, using raw text');
      requirements = { rawAnalysis: text };
    }

    return {
      extractedText: text,
      requirements
    };

  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}
