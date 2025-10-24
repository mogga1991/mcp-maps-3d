// Test Crexi scraper for commercial lease properties
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║      Crexi Commercial Lease Property Search Test      ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('🏢 Platform: Crexi.com');
console.log('🎯 Target: Office space FOR LEASE in Chicago');
console.log('📦 Scraper: memo23/apify-crexi\n');

// Crexi input format - try multiple URL formats
const testCases = [
    {
        name: "Chicago Office Lease Search",
        input: {
            "startUrls": [
                "https://www.crexi.com/properties/lease/il-chicago/office"
            ],
            "maxItems": 5,
            "proxyConfiguration": {
                "useApifyProxy": true
            }
        }
    },
    {
        name: "Chicago Office Search (Alternative)",
        input: {
            "startUrls": [
                "https://www.crexi.com/properties?searchType=lease&location=Chicago%2C%20IL&propertyTypes=office"
            ],
            "maxItems": 5,
            "proxyConfiguration": {
                "useApifyProxy": true
            }
        }
    }
];

async function testCrexi(testCase) {
    console.log('─'.repeat(70));
    console.log(`\n🧪 TEST: ${testCase.name}\n`);
    console.log('📋 Input:');
    console.log(JSON.stringify(testCase.input, null, 2));
    console.log('\n🚀 Starting scraper...\n');

    try {
        const run = await client.actor("memo23/apify-crexi").call(testCase.input);

        console.log(`✅ Run Status: ${run.status}`);
        console.log(`🆔 Run ID: ${run.id}`);
        console.log(`💰 Compute Units: ${run.stats?.computeUnits || 'N/A'}`);
        console.log(`⏱️  Duration: ${run.stats?.runTimeSecs || 'N/A'} seconds\n`);

        // Fetch results
        console.log('📥 Fetching results...\n');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`📊 Results: ${items.length} properties found\n`);

        if (items.length === 0) {
            console.log('⚠️  No properties found with this URL format\n');
            return { success: false, count: 0, items: [] };
        }

        console.log('═'.repeat(70) + '\n');

        // Display results
        items.forEach((property, index) => {
            console.log(`🏢 PROPERTY ${index + 1}:`);
            console.log('─'.repeat(70));

            // Basic info
            console.log(`Title: ${property.title || property.name || property.propertyName || 'N/A'}`);
            console.log(`Address: ${property.address || property.location || property.streetAddress || 'N/A'}`);
            console.log(`City: ${property.city || 'N/A'}, State: ${property.state || 'N/A'}`);

            // Lease vs Sale
            console.log(`\n💰 TRANSACTION TYPE:`);
            console.log(`   Listing Type: ${property.listingType || property.transactionType || 'N/A'}`);

            if (property.leaseRate || property.rent || property.rentalRate || property.price?.lease) {
                console.log(`   ✅ FOR LEASE`);
                console.log(`   Lease Rate: ${property.leaseRate || property.rent || property.rentalRate || property.price?.lease || 'N/A'}`);
            }
            if (property.salePrice || property.askingPrice || property.price?.sale) {
                console.log(`   📌 Also for sale: ${property.salePrice || property.askingPrice || property.price?.sale}`);
            }

            // Property details
            console.log(`\n📏 PROPERTY DETAILS:`);
            console.log(`   Size: ${property.size || property.squareFootage || property.sqft || property.buildingSize || 'N/A'}`);
            console.log(`   Type: ${property.propertyType || property.type || property.buildingType || 'N/A'}`);
            console.log(`   Status: ${property.status || property.listingStatus || 'N/A'}`);

            // CRITICAL: Broker/Agent contact information
            console.log(`\n📞 CONTACT INFORMATION:`);

            let contactFound = false;

            // Check multiple possible contact field structures
            if (property.broker) {
                console.log(`   ✅ Broker Information Found:`);
                console.log(`      Name: ${property.broker.name || property.broker.brokerName || 'N/A'}`);
                console.log(`      Email: ${property.broker.email || 'N/A'}`);
                console.log(`      Phone: ${property.broker.phone || property.broker.phoneNumber || 'N/A'}`);
                console.log(`      Company: ${property.broker.company || property.broker.brokerage || 'N/A'}`);
                contactFound = true;
            }

            if (property.agent) {
                console.log(`   ✅ Agent Information Found:`);
                console.log(`      Name: ${property.agent.name || 'N/A'}`);
                console.log(`      Email: ${property.agent.email || 'N/A'}`);
                console.log(`      Phone: ${property.agent.phone || 'N/A'}`);
                console.log(`      Company: ${property.agent.company || 'N/A'}`);
                contactFound = true;
            }

            if (property.contact) {
                console.log(`   ✅ Contact Information Found:`);
                console.log(`      Name: ${property.contact.name || 'N/A'}`);
                console.log(`      Email: ${property.contact.email || 'N/A'}`);
                console.log(`      Phone: ${property.contact.phone || 'N/A'}`);
                console.log(`      Company: ${property.contact.company || 'N/A'}`);
                contactFound = true;
            }

            if (property.listingAgent || property.listingBroker) {
                const contact = property.listingAgent || property.listingBroker;
                console.log(`   ✅ Listing Contact Found:`);
                console.log(`      Name: ${contact.name || 'N/A'}`);
                console.log(`      Email: ${contact.email || 'N/A'}`);
                console.log(`      Phone: ${contact.phone || 'N/A'}`);
                contactFound = true;
            }

            if (!contactFound) {
                console.log(`   ⚠️  No contact information found`);
                console.log(`   Available fields: ${Object.keys(property).join(', ')}`);
            }

            // URLs and additional info
            if (property.url || property.propertyUrl || property.listingUrl) {
                console.log(`\n🔗 Listing URL: ${property.url || property.propertyUrl || property.listingUrl}`);
            }

            if (property.images && property.images.length > 0) {
                console.log(`📸 Images: ${property.images.length} available`);
            }

            console.log('\n' + '═'.repeat(70) + '\n');
        });

        // Save results
        const fs = await import('fs');
        const filename = `crexi_lease_results_${testCase.name.replace(/\s+/g, '_').toLowerCase()}.json`;
        fs.writeFileSync(filename, JSON.stringify(items, null, 2));
        console.log(`✅ Full results saved to: ${filename}\n`);

        return { success: true, count: items.length, items };

    } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
        if (error.statusCode === 404) {
            console.log('💡 The actor might not be accessible or requires subscription.\n');
        }
        return { success: false, count: 0, error: error.message };
    }
}

// Main test sequence
async function runTests() {
    const results = [];

    // Try first URL format
    console.log('🧪 Testing URL Format #1...\n');
    const result1 = await testCrexi(testCases[0]);
    results.push(result1);

    if (!result1.success || result1.count === 0) {
        console.log('\n🔄 Trying alternative URL format...\n');
        const result2 = await testCrexi(testCases[1]);
        results.push(result2);
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 TEST SUMMARY\n');
    console.log('─'.repeat(70));

    const successfulTests = results.filter(r => r.success && r.count > 0);
    const totalProperties = results.reduce((sum, r) => sum + r.count, 0);

    console.log(`Tests Run: ${results.length}`);
    console.log(`Successful: ${successfulTests.length}`);
    console.log(`Total Properties: ${totalProperties}`);

    if (successfulTests.length > 0) {
        console.log('\n✅ SUCCESS! Crexi scraper is working!\n');

        // Analyze data quality
        const allItems = successfulTests.flatMap(r => r.items);
        const leaseProperties = allItems.filter(p =>
            p.leaseRate || p.rent || p.listingType?.toLowerCase().includes('lease')
        );
        const withContact = allItems.filter(p =>
            p.broker || p.agent || p.contact || p.listingAgent
        );

        console.log('📈 Data Quality Analysis:');
        console.log(`   Lease Properties: ${leaseProperties.length}/${totalProperties} (${(leaseProperties.length/totalProperties*100).toFixed(0)}%)`);
        console.log(`   With Contact Info: ${withContact.length}/${totalProperties} (${(withContact.length/totalProperties*100).toFixed(0)}%)`);

        if (withContact.length > 0) {
            console.log('\n🎉 Broker contact information IS being extracted!');
        }

        console.log('\n✅ Next Steps:');
        console.log('   1. Verify lease rates and terms');
        console.log('   2. Test with multiple cities');
        console.log('   3. Compare with LoopNet coverage');
        console.log('   4. Build backend integration');

    } else {
        console.log('\n⚠️  No results from any URL format\n');
        console.log('📝 Recommendations:');
        console.log('   1. Review Crexi scraper documentation');
        console.log('   2. Try different search parameters');
        console.log('   3. Check if subscription is required');
        console.log('   4. Move to Option 1 (LoopNet debugging)');
    }

    console.log('\n' + '═'.repeat(70) + '\n');
}

// Run all tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
