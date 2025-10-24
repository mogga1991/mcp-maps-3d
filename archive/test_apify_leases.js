// Test script for Apify API - Commercial Lease Property Search
// This tests the Apify API directly to search for lease properties

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const APIFY_TOKEN = process.env.APIFY_TOKEN;

// Test 1: Verify Apify API Connection
async function testApifyConnection() {
  console.log('🔍 Test 1: Verifying Apify API Connection...\n');

  try {
    const response = await fetch('https://api.apify.com/v2/acts', {
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Apify API Connection Successful!');
      console.log(`📊 Total actors available: ${data.total || 'Unknown'}`);
      console.log('');
      return true;
    } else {
      console.log('❌ Apify API Connection Failed');
      console.log(`Status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Apify API Connection Error:', error.message);
    return false;
  }
}

// Test 2: Search for Commercial Real Estate Scrapers
async function searchRealEstateActors() {
  console.log('🔍 Test 2: Searching for Commercial Real Estate Actors...\n');

  try {
    const searchTerms = ['loopnet', 'commercial real estate', 'crexi', 'office lease'];

    for (const term of searchTerms) {
      const response = await fetch(
        `https://api.apify.com/v2/store?search=${encodeURIComponent(term)}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_TOKEN}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`📋 Search results for "${term}":`);

        if (data.data && data.data.items) {
          data.data.items.forEach((actor, index) => {
            console.log(`   ${index + 1}. ${actor.name || actor.title}`);
            console.log(`      ID: ${actor.username}/${actor.name}`);
            console.log(`      Description: ${(actor.description || '').substring(0, 100)}...`);
          });
        } else {
          console.log('   No results found');
        }
        console.log('');
      }
    }

    return true;
  } catch (error) {
    console.log('❌ Error searching actors:', error.message);
    return false;
  }
}

// Test 3: Get LoopNet Scraper Details
async function getLoopNetScraperDetails() {
  console.log('🔍 Test 3: Getting LoopNet Scraper Details...\n');

  const scrapers = [
    'piotrv1001/loopnet-listings-scraper',
    'memo23/apify-loopnet-search-cheerio',
    'getdataforme/loopnet-scraper'
  ];

  for (const actorId of scrapers) {
    try {
      const response = await fetch(
        `https://api.apify.com/v2/acts/${actorId}`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_TOKEN}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found: ${data.data.name}`);
        console.log(`   ID: ${actorId}`);
        console.log(`   Title: ${data.data.title || 'N/A'}`);
        console.log(`   Description: ${(data.data.description || '').substring(0, 150)}...`);
        console.log(`   Latest Version: ${data.data.versions?.[0] || 'N/A'}`);
        console.log(`   Stats: ${data.data.stats?.totalRuns || 0} runs, ${data.data.stats?.totalUsers || 0} users`);
        console.log('');
      } else {
        console.log(`❌ Actor not found: ${actorId}`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ Error getting ${actorId}:`, error.message);
      console.log('');
    }
  }

  return true;
}

// Test 4: Run a Sample LoopNet Lease Search
async function runLoopNetLeaseSearch() {
  console.log('🔍 Test 4: Running Sample LoopNet Lease Search...\n');
  console.log('⏳ This may take 30-60 seconds...\n');

  // Using the LoopNet listings scraper
  const actorId = 'piotrv1001/loopnet-listings-scraper';

  const input = {
    // LoopNet search URL for Chicago office space FOR LEASE
    searchUrl: 'https://www.loopnet.com/search/office-space/chicago-il/for-lease/',
    maxListings: 5,
    includeDetails: true
  };

  try {
    // Start the actor run
    console.log('🚀 Starting actor run...');
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${APIFY_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      }
    );

    if (!runResponse.ok) {
      console.log('❌ Failed to start actor run');
      console.log(`Status: ${runResponse.status}`);
      const errorText = await runResponse.text();
      console.log('Error:', errorText);
      return false;
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;
    console.log(`✅ Actor run started: ${runId}`);
    console.log('⏳ Waiting for results...\n');

    // Wait for run to complete (check every 5 seconds, max 2 minutes)
    let completed = false;
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_TOKEN}`
          }
        }
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data.status;

        process.stdout.write(`   Status: ${status}... (attempt ${attempts + 1}/${maxAttempts})\r`);

        if (status === 'SUCCEEDED') {
          completed = true;
          console.log('\n✅ Run completed successfully!\n');
        } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.log(`\n❌ Run ${status.toLowerCase()}`);
          return false;
        }
      }

      attempts++;
    }

    if (!completed) {
      console.log('\n⚠️  Run is taking longer than expected. Results may still be processing.');
      console.log(`   You can check status at: https://console.apify.com/actors/runs/${runId}\n`);
      return false;
    }

    // Get the results
    console.log('📥 Fetching results...\n');
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
      {
        headers: {
          'Authorization': `Bearer ${APIFY_TOKEN}`
        }
      }
    );

    if (datasetResponse.ok) {
      const results = await datasetResponse.json();

      console.log('📊 RESULTS:\n');
      console.log(`Found ${results.length} lease properties\n`);

      results.forEach((property, index) => {
        console.log(`─────────────────────────────────────────────────────`);
        console.log(`Property ${index + 1}:`);
        console.log(`Title: ${property.title || property.name || 'N/A'}`);
        console.log(`Address: ${property.address || property.location || 'N/A'}`);
        console.log(`Price/Rent: ${property.price || property.leaseRate || property.rent || 'N/A'}`);
        console.log(`Size: ${property.size || property.squareFootage || 'N/A'} sq ft`);
        console.log(`Type: ${property.propertyType || property.type || 'N/A'}`);

        // Check for contact information
        if (property.agent || property.contact || property.listingAgent) {
          console.log('\n📞 CONTACT INFORMATION:');
          const contact = property.agent || property.contact || property.listingAgent;
          console.log(`   Agent: ${contact.name || contact.agentName || 'N/A'}`);
          console.log(`   Email: ${contact.email || contact.agentEmail || 'N/A'}`);
          console.log(`   Phone: ${contact.phone || contact.agentPhone || 'N/A'}`);
          console.log(`   Company: ${contact.company || contact.brokerage || 'N/A'}`);
        } else {
          console.log('\n⚠️  Contact information: Not available in this result');
          console.log('   Raw data keys:', Object.keys(property).join(', '));
        }

        console.log(`\nListing URL: ${property.url || property.listingUrl || 'N/A'}`);
        console.log('');
      });

      // Save results to file for inspection
      const fs = await import('fs');
      fs.writeFileSync(
        'apify_lease_results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('✅ Full results saved to: apify_lease_results.json\n');

      return true;
    } else {
      console.log('❌ Failed to fetch results');
      return false;
    }

  } catch (error) {
    console.log('❌ Error running lease search:', error.message);
    console.log(error.stack);
    return false;
  }
}

// Main test sequence
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Apify Commercial Lease Property Search - Test Suite  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const test1 = await testApifyConnection();
  if (!test1) {
    console.log('❌ Cannot proceed without Apify API connection');
    return;
  }

  console.log('═'.repeat(56) + '\n');

  await searchRealEstateActors();

  console.log('═'.repeat(56) + '\n');

  await getLoopNetScraperDetails();

  console.log('═'.repeat(56) + '\n');

  await runLoopNetLeaseSearch();

  console.log('═'.repeat(56));
  console.log('\n🎉 All tests completed!\n');
  console.log('Next Steps:');
  console.log('1. Review apify_lease_results.json for full property data');
  console.log('2. Check if contact information is being extracted');
  console.log('3. Verify lease rates vs sale prices');
  console.log('4. Test alternative scrapers if needed\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
