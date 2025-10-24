import { ApifyClient } from 'apify-client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search for commercial real estate properties using Apify Real Estate scraper
 * Falls back to Gemini if Apify is not configured
 *
 * @param {object} requirements - Extracted RLP requirements
 * @returns {Promise<Array>} Array of property listings
 */
export async function searchProperties(requirements) {
  try {
    console.log('🔍 Searching for properties with requirements:', JSON.stringify(requirements, null, 2));

    // Try Apify first if API key is configured
    if (process.env.APIFY_API_KEY && process.env.APIFY_API_KEY !== 'your_apify_api_key_here') {
      console.log('🚀 Using Apify Real Estate Data Scraper');
      return await searchWithApify(requirements);
    } else {
      console.log('⚠️  Apify not configured, falling back to Gemini grounding');
      return await searchWithGemini(requirements);
    }

  } catch (error) {
    console.error('❌ Property search error:', error);
    // If Apify fails, try Gemini as fallback
    if (process.env.APIFY_API_KEY) {
      console.log('⚠️  Apify failed, trying Gemini fallback...');
      try {
        return await searchWithGemini(requirements);
      } catch (geminiError) {
        console.error('❌ Gemini fallback also failed:', geminiError);
        throw new Error(`Property search failed: ${error.message}`);
      }
    }
    throw new Error(`Property search failed: ${error.message}`);
  }
}

/**
 * Search properties using Apify Real Estate Data Scraper
 */
async function searchWithApify(requirements) {
  // Build search query from requirements
  const searchQuery = buildSearchQuery(requirements);
  console.log('📝 Apify search query:', searchQuery);

  // Prepare Apify actor input
  const input = {
    searchQueries: [searchQuery],
    maxItems: 10, // Get up to 10 properties
    includePhotos: true,
    includeContacts: true,
    // Map our requirements to Apify filters
    propertyType: mapPropertyType(requirements.spaceType),
  };

  // Add location if available
  if (requirements.location) {
    input.location = requirements.location;
  }

  // Add size filters if available
  if (requirements.squareFootage) {
    if (requirements.squareFootage.min) {
      input.minSquareFootage = requirements.squareFootage.min;
    }
    if (requirements.squareFootage.max) {
      input.maxSquareFootage = requirements.squareFootage.max;
    }
  }

  console.log('🎯 Apify input:', JSON.stringify(input, null, 2));

  // Run the Apify actor
  // Using a popular real estate scraper - adjust actor ID based on which one works best
  const run = await apifyClient.actor('dtrungtin/realestate-scraper').call(input);

  console.log('⏳ Waiting for Apify results...');

  // Fetch results from the dataset
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  console.log(`✅ Apify returned ${items.length} properties`);

  // Transform Apify results to our property format
  const properties = items.map(item => transformApifyProperty(item, requirements));

  // Use Gemini to enrich properties with better summaries and match scoring
  const enrichedProperties = await enrichPropertiesWithAI(properties, requirements);

  return enrichedProperties;
}

/**
 * Transform Apify property data to our format
 */
function transformApifyProperty(apifyItem, requirements) {
  // Apify scrapers return different formats depending on the source
  // This handles common fields across different scrapers

  return {
    name: apifyItem.name || apifyItem.title || apifyItem.address || 'Property Listing',
    address: apifyItem.address || apifyItem.streetAddress || '',
    city: apifyItem.city || requirements.location?.split(',')[0] || '',
    state: apifyItem.state || requirements.location?.split(',')[1]?.trim() || '',
    latitude: apifyItem.latitude || apifyItem.lat || 0,
    longitude: apifyItem.longitude || apifyItem.lng || apifyItem.lon || 0,
    price: apifyItem.price || apifyItem.rentPrice || apifyItem.leaseRate || 'Contact for pricing',
    size: apifyItem.size || apifyItem.squareFootage || apifyItem.buildingSize || 'Size not specified',
    propertyType: apifyItem.propertyType || apifyItem.type || 'Commercial',
    summary: apifyItem.description || apifyItem.summary || 'Property details available upon request',
    broker: apifyItem.broker || apifyItem.agent || apifyItem.contactName || 'Contact broker',
    propertyManager: apifyItem.propertyManager || apifyItem.company || '',
    contactPhone: apifyItem.phone || apifyItem.contactPhone || 'Call for details',
    contactEmail: apifyItem.email || apifyItem.contactEmail || '',
    website: apifyItem.url || apifyItem.listingUrl || apifyItem.sourceUrl || '',
    availableDate: apifyItem.availableDate || apifyItem.availability || 'Contact for availability',
    parking: apifyItem.parking || requirements.parking || 'Contact for parking details',
    features: apifyItem.features || apifyItem.amenities || [],
    images: apifyItem.images || apifyItem.photos || apifyItem.photoUrls || [],
    sourceUrl: apifyItem.url || apifyItem.listingUrl || apifyItem.sourceUrl || ''
  };
}

/**
 * Use Gemini to enrich properties with better summaries and match analysis
 */
async function enrichPropertiesWithAI(properties, requirements) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a commercial real estate expert. Analyze these properties and enhance them:

REQUIREMENTS:
${JSON.stringify(requirements, null, 2)}

PROPERTIES:
${JSON.stringify(properties, null, 2)}

For each property:
1. Improve the summary to highlight why it matches the requirements
2. Add a matchScore (0-100) based on how well it fits the requirements
3. If coordinates are missing (0,0), try to geocode the address

Return the properties array with these enhancements as JSON. Keep all existing fields and add:
- Enhanced "summary" field
- New "matchScore" field (number 0-100)
- Updated latitude/longitude if they were 0

Return ONLY the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const enriched = JSON.parse(jsonMatch[0]);
      console.log('✨ Properties enriched with AI analysis');
      return enriched;
    }

    // If AI enrichment fails, return original properties
    console.warn('⚠️  AI enrichment failed, returning original properties');
    return properties;

  } catch (error) {
    console.error('⚠️  Error enriching properties:', error);
    return properties; // Return original properties on error
  }
}

/**
 * Fallback: Search properties using Gemini with Google Search grounding
 */
async function searchWithGemini(requirements) {
  const searchQuery = buildSearchQuery(requirements);
  console.log('📝 Gemini search query:', searchQuery);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: [{ googleSearch: {} }]
  });

  const prompt = `You are a commercial real estate expert. Find REAL, currently available commercial properties that match these requirements:

${JSON.stringify(requirements, null, 2)}

Search for: ${searchQuery}

Return a JSON array of 3-5 properties with this structure:
[
  {
    "name": "Property name",
    "address": "Full address",
    "city": "City",
    "state": "State",
    "latitude": number,
    "longitude": number,
    "price": "Lease rate",
    "size": "Square footage",
    "propertyType": "Office|Warehouse|Industrial|Retail",
    "summary": "Why it matches requirements",
    "broker": "Broker name",
    "propertyManager": "Company",
    "contactPhone": "Phone",
    "contactEmail": "Email",
    "website": "URL",
    "availableDate": "Date",
    "parking": "Parking details",
    "features": ["feature1", "feature2"],
    "images": ["image_url_1", "image_url_2"],
    "sourceUrl": "Listing URL"
  }
]

Extract real image URLs from LoopNet, Crexi, or CoStar search results if available.
Return ONLY the JSON array.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    const properties = JSON.parse(jsonMatch[0]);

    // Add placeholder images if missing
    return properties.map(prop => ({
      ...prop,
      images: prop.images?.length > 0 ? prop.images : [getPlaceholderImage(prop.propertyType)]
    }));
  }

  return [];
}

/**
 * Build a detailed search query from RLP requirements
 */
function buildSearchQuery(requirements) {
  const parts = [];

  if (requirements.location) {
    parts.push(requirements.location);
  }

  if (requirements.spaceType) {
    parts.push(requirements.spaceType);
  }

  if (requirements.squareFootage) {
    if (requirements.squareFootage.min || requirements.squareFootage.max) {
      const min = requirements.squareFootage.min || 0;
      const max = requirements.squareFootage.max || min * 2;
      parts.push(`${min}-${max} sq ft`);
    }
  }

  parts.push('commercial real estate for lease');

  return parts.join(' ');
}

/**
 * Map our space type to Apify property type filter
 */
function mapPropertyType(spaceType) {
  if (!spaceType) return undefined;

  const type = spaceType.toLowerCase();
  if (type.includes('office')) return 'office';
  if (type.includes('warehouse')) return 'warehouse';
  if (type.includes('industrial')) return 'industrial';
  if (type.includes('retail')) return 'retail';
  if (type.includes('flex')) return 'flex';

  return undefined;
}

/**
 * Get placeholder image based on property type
 */
function getPlaceholderImage(propertyType) {
  const type = (propertyType || '').toLowerCase();

  if (type.includes('office')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
  } else if (type.includes('warehouse') || type.includes('industrial')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80';
  } else if (type.includes('retail')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';
  } else {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';
  }
}
