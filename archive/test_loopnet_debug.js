// Debug LoopNet scraper - try multiple URL formats and approaches
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     LoopNet Scraper Debugging - Multiple URL Formats        ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Test different URL formats and input structures
const testCases = [
    {
        name: "Test 1: Search Results URL (for-lease)",
        scraper: "piotrv1001/loopnet-listings-scraper",
        input: {
            "searchUrls": [
                "https://www.loopnet.com/search/office-buildings/chicago-il/for-lease/"
            ],
            "maxListings": 5
        }
    },
    {
        name: "Test 2: Simple Search URL",
        scraper: "piotrv1001/loopnet-listings-scraper",
        input: {
            "searchUrls": [
                "https://www.loopnet.com/search/?sk=18ed5f2b0b36a2a4e92be8d2ae4ed7e6&bb=yq4mpo0_qHu23k_lFw"
            ],
            "maxListings": 5
        }
    },
    {
        name: "Test 3: Generic Office Space Search",
        scraper: "piotrv1001/loopnet-listings-scraper",
        input: {
            "searchUrls": [
                "https://www.loopnet.com/search/office-space/"
            ],
            "maxListings": 3
        }
    },
    {
        name: "Test 4: Direct Listing URL (if we have one)",
        scraper: "piotrv1001/loopnet-listings-scraper",
        input: {
            "searchUrls": [
                "https://www.loopnet.com/Listing/123-Main-St/"  // Placeholder
            ],
            "maxListings": 1
        },
        skip: true  // Skip this test unless we have a real URL
    },
    {
        name: "Test 5: Alternative Free Scraper",
        scraper: "getdataforme/loopnet-scraper",
        input: {
            "startUrls": [
                { "url": "https://www.loopnet.com/search/office-space/chicago-il/for-lease/" }
            ],
            "maxResults": 5
        }
    }
];

async function runTest(testCase) {
    if (testCase.skip) {
        console.log(`⏭️  Skipping: ${testCase.name}\n`);
        return { skipped: true };
    }

    console.log('═'.repeat(70));
    console.log(`\n🧪 ${testCase.name}`);
    console.log(`📦 Scraper: ${testCase.scraper}\n`);
    console.log('📋 Input:');
    console.log(JSON.stringify(testCase.input, null, 2));
    console.log('\n🚀 Running...\n');

    try {
        const start = Date.now();
        const run = await client.actor(testCase.scraper).call(testCase.input);
        const duration = ((Date.now() - start) / 1000).toFixed(1);

        console.log(`✅ Status: ${run.status}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`💰 Compute Units: ${run.stats?.computeUnits?.toFixed(4) || 'N/A'}\n`);

        if (run.status !== 'SUCCEEDED') {
            console.log(`⚠️  Run did not succeed. Status: ${run.status}\n`);
            return { success: false, status: run.status };
        }

        // Get results
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`📊 Results: ${items.length} properties\n`);

        if (items.length > 0) {
            console.log('🎉 SUCCESS! Found properties!\n');

            // Show first result in detail
            const first = items[0];
            console.log('📄 First Result Sample:');
            console.log('─'.repeat(70));
            console.log(`Title: ${first.title || first.name || 'N/A'}`);
            console.log(`Address: ${first.address || first.location || 'N/A'}`);
            console.log(`Price/Lease: ${first.price || first.leaseRate || first.rent || 'N/A'}`);
            console.log(`Size: ${first.size || first.squareFootage || 'N/A'}`);

            // Check for contact info
            console.log(`\n📞 Contact Check:`);
            if (first.agent || first.contact || first.broker || first.listingAgent) {
                console.log(`   ✅ Contact information present!`);
                const contact = first.agent || first.contact || first.broker || first.listingAgent;
                console.log(`   Fields available: ${Object.keys(contact).join(', ')}`);
            } else {
                console.log(`   ⚠️  No contact info in standard fields`);
                console.log(`   Available top-level fields: ${Object.keys(first).slice(0, 15).join(', ')}...`);
            }

            // Save sample
            const fs = await import('fs');
            const filename = `loopnet_test_${testCase.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            fs.writeFileSync(filename, JSON.stringify(items, null, 2));
            console.log(`\n💾 Saved to: ${filename}`);

            return {
                success: true,
                count: items.length,
                filename,
                hasContact: !!(first.agent || first.contact || first.broker)
            };
        } else {
            console.log('⚠️  No properties returned (empty dataset)\n');
            return { success: true, count: 0 };
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);

        if (error.message?.includes('rent a paid Actor')) {
            console.log('   💰 This scraper requires a paid subscription\n');
        } else if (error.message?.includes('Input is not valid')) {
            console.log('   📝 Input format is incorrect for this scraper\n');
            console.log(`   Error details: ${error.message}\n`);
        } else {
            console.log(`   Details: ${error.statusCode || 'Unknown error'}\n`);
        }

        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('Starting comprehensive LoopNet scraper tests...\n');
    console.log('Goal: Find the correct URL format and scraper combination\n');

    const results = [];

    for (const testCase of testCases) {
        const result = await runTest(testCase);
        results.push({ ...result, name: testCase.name });

        // If we get a working result, we can stop
        if (result.success && result.count > 0) {
            console.log('\n🎊 BREAKTHROUGH! We found a working configuration!\n');
            break;
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 TEST SUMMARY\n');
    console.log('─'.repeat(70));

    const successful = results.filter(r => r.success && r.count > 0);
    const failed = results.filter(r => !r.success && !r.skipped);
    const empty = results.filter(r => r.success && r.count === 0);

    console.log(`Total Tests: ${results.filter(r => !r.skipped).length}`);
    console.log(`✅ Successful (with results): ${successful.length}`);
    console.log(`⚠️  Successful (no results): ${empty.length}`);
    console.log(`❌ Failed: ${failed.length}\n`);

    if (successful.length > 0) {
        console.log('🎉 WORKING CONFIGURATIONS:\n');
        successful.forEach(r => {
            console.log(`   ✅ ${r.name}`);
            console.log(`      Properties: ${r.count}`);
            console.log(`      Contact Info: ${r.hasContact ? 'Yes ✅' : 'Check manually'}`);
            console.log(`      File: ${r.filename}\n`);
        });

        console.log('\n📝 NEXT STEPS:');
        console.log('   1. Review the JSON output files');
        console.log('   2. Verify contact information fields');
        console.log('   3. Confirm lease vs sale properties');
        console.log('   4. Use working configuration in production');
        console.log('   5. Build backend integration\n');

    } else if (empty.length > 0) {
        console.log('⚠️  PARTIAL SUCCESS:\n');
        console.log('   Scrapers ran but returned no results.');
        console.log('   This could mean:\n');
        console.log('   1. URL format is close but not quite right');
        console.log('   2. LoopNet changed their page structure');
        console.log('   3. Need different search parameters\n');

        console.log('📝 RECOMMENDATIONS:\n');
        console.log('   1. Manually visit LoopNet.com and perform a search');
        console.log('   2. Copy the exact URL from your browser');
        console.log('   3. Test with that URL');
        console.log('   4. Try scraping a specific listing URL first\n');

    } else {
        console.log('❌ NO WORKING CONFIGURATIONS FOUND\n');
        console.log('📝 NEXT STEPS:\n');
        console.log('   1. Contact scraper authors for support');
        console.log('   2. Consider paid scrapers ($29/month)');
        console.log('   3. Build custom scraper (time-intensive)');
        console.log('   4. Use alternative platforms (Crexi with subscription)\n');
    }

    // Show errors
    if (failed.length > 0) {
        console.log('\n❌ ERRORS ENCOUNTERED:\n');
        failed.forEach(r => {
            console.log(`   ${r.name}:`);
            console.log(`   ${r.error || r.status}\n`);
        });
    }

    console.log('═'.repeat(70) + '\n');
}

main().catch(console.error);
