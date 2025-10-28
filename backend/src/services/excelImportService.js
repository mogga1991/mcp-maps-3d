import XLSX from 'xlsx';
import { sql } from '../config/database.js';

/**
 * Parse Excel file and extract property data
 * @param {Buffer} fileBuffer - The Excel file buffer
 * @returns {Array} Array of property objects
 */
function parseExcelFile(fileBuffer) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON, starting from row 4 (index 3) since row 3 has headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: 2, // Start from row 3 (0-indexed)
      defval: null
    });

    console.log(`Parsed ${jsonData.length} properties from Excel file`);

    return jsonData;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Transform Excel row data to database property format
 * @param {Object} row - Excel row data
 * @returns {Object} Property object for database
 */
function transformExcelRowToProperty(row) {
  // Clean and parse square footage (remove commas)
  const sqFtString = row['Sq Ft'] ? String(row['Sq Ft']).replace(/,/g, '') : null;
  const squareFootage = sqFtString ? parseInt(sqFtString, 10) : null;

  // Parse building types (comma-separated string)
  const buildingTypes = row['Building Type']
    ? row['Building Type'].split(',').map(type => type.trim())
    : [];

  // Parse number of suites
  const numberOfSuites = row['Suites'] ? parseInt(String(row['Suites']), 10) : null;

  // Generate a listing URL placeholder (since Excel doesn't have URLs)
  // Use a placeholder URL format since listing_url is NOT NULL in the schema
  const address = row['Address'] || 'unknown';
  const city = row['City'] || 'unknown';
  const listingUrl = `https://placeholder.com/property/${encodeURIComponent(address)}-${encodeURIComponent(city)}`;

  return {
    address: row['Address'], // Required field, validated before calling this function
    city: row['City'], // Required field
    state: row['State'], // Required field
    zip: String(row['Zip']), // Required field
    property_name: null, // Excel doesn't have property name
    building_types: buildingTypes, // Required field (already validated)
    square_feet: squareFootage,
    suites: numberOfSuites,
    rate_raw: row['Rate'] || null,
    longitude: row['Longitude'], // Required field
    latitude: row['Latitude'], // Required field
    listing_url: listingUrl, // Required field (generated)
    scrape_status: 'pending', // New properties start as pending
    is_active: true,
    source: 'excel_upload'
  };
}

/**
 * Import properties from Excel file into database
 * @param {Buffer} fileBuffer - The Excel file buffer
 * @returns {Object} Import results
 */
async function importPropertiesFromExcel(fileBuffer) {
  if (!sql) {
    throw new Error('Database not configured');
  }

  try {
    // Parse Excel file
    const excelData = parseExcelFile(fileBuffer);

    if (!excelData || excelData.length === 0) {
      return {
        success: false,
        message: 'No data found in Excel file',
        imported: 0,
        failed: 0,
        errors: []
      };
    }

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      duplicatesInFile: 0,
      errors: []
    };

    // Track properties already processed in this file to prevent duplicates within the same upload
    const processedProperties = new Set();

    // Process each row
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      try {
        // Skip rows without required fields
        if (!row['Address'] || !row['City'] || !row['State'] || !row['Zip']) {
          console.log(`Skipping row ${i + 1}: missing required address fields`);
          results.skipped++;
          continue;
        }

        if (!row['Latitude'] || !row['Longitude']) {
          console.log(`Skipping row ${i + 1}: missing latitude/longitude`);
          results.skipped++;
          continue;
        }

        if (!row['Building Type']) {
          console.log(`Skipping row ${i + 1}: missing building type`);
          results.skipped++;
          continue;
        }

        // Transform to property format
        const property = transformExcelRowToProperty(row);

        // Normalize values for comparison (trim and lowercase)
        const normalizedAddress = property.address?.trim().toLowerCase() || '';
        const normalizedCity = property.city?.trim().toLowerCase() || '';
        const normalizedState = property.state?.trim().toUpperCase() || '';

        // Create unique key for this property
        const propertyKey = `${normalizedAddress}|${normalizedCity}|${normalizedState}`;

        // Check if this property was already processed in this file
        if (processedProperties.has(propertyKey)) {
          console.log(`Duplicate found in file at row ${i + 1}: ${property.address}`);
          results.duplicatesInFile++;
          results.skipped++;
          continue;
        }

        // Add to processed set
        processedProperties.add(propertyKey);

        // Check if property already exists in database (case-insensitive)
        const existing = await sql`
          SELECT id FROM properties
          WHERE LOWER(TRIM(address)) = ${normalizedAddress}
            AND LOWER(TRIM(city)) = ${normalizedCity}
            AND UPPER(TRIM(state)) = ${normalizedState}
          LIMIT 1
        `;

        if (existing && existing.length > 0) {
          // Property exists - update it
          console.log(`Updating existing property: ${property.address}, ${property.city}, ${property.state}`);

          await sql`
            UPDATE properties
            SET building_types = ${property.building_types},
                square_feet = ${property.square_feet},
                suites = ${property.suites},
                rate_raw = ${property.rate_raw},
                longitude = ${property.longitude},
                latitude = ${property.latitude},
                zip = ${property.zip},
                last_updated = NOW()
            WHERE id = ${existing[0].id}
          `;

          results.updated++;
        } else {
          // New property - insert it
          console.log(`Importing new property: ${property.address}, ${property.city}, ${property.state}`);

          await sql`
            INSERT INTO properties (
              address, city, state, zip,
              building_types, square_feet, suites, rate_raw,
              longitude, latitude, listing_url, scrape_status, is_active,
              source
            ) VALUES (
              ${property.address?.trim()},
              ${property.city?.trim()},
              ${property.state?.trim().toUpperCase()},
              ${property.zip},
              ${property.building_types},
              ${property.square_feet},
              ${property.suites},
              ${property.rate_raw},
              ${property.longitude},
              ${property.latitude},
              ${property.listing_url},
              ${property.scrape_status},
              ${property.is_active},
              ${property.source}
            )
          `;

          results.imported++;
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.failed++;
        results.errors.push({
          row: i + 1,
          address: row['Address'],
          error: error.message
        });
      }
    }

    const message = results.duplicatesInFile > 0
      ? `Import completed: ${results.imported} new, ${results.updated} updated, ${results.failed} failed, ${results.skipped} skipped (${results.duplicatesInFile} duplicates in file)`
      : `Import completed: ${results.imported} new, ${results.updated} updated, ${results.failed} failed, ${results.skipped} skipped`;

    return {
      success: true,
      message,
      ...results
    };

  } catch (error) {
    console.error('Error importing properties from Excel:', error);
    throw error;
  }
}

export {
  parseExcelFile,
  transformExcelRowToProperty,
  importPropertiesFromExcel
};
