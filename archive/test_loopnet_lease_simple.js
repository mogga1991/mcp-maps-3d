// Simple test to search LoopNet for LEASE properties using Apify
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

console.log('🔍 Testing LoopNet Lease Property Search\n');
console.log('Using: piotrv1001/loopnet-listings-scraper');
console.log('Target: Office space FOR LEASE in Chicago\n');

// Input for the LoopNet scraper
// IMPORTANT: We need to search for LEASE properties, not sale
const input = {
    // LoopNet search URL for office space FOR LEASE in Chicago
    "searchUrls": [
        "https://www.loopnet.com/search/office-space/chicago-il/for-lease/"
    ],
    "maxListings": 5
};

console.log('📋 Search Parameters:');
console.log(JSON.stringify(input, null, 2));
console.log('\n🚀 Starting scraper run...\n');

try {
    // Run the actor
    const run = await client.actor("piotrv1001/loopnet-listings-scraper").call(input);

    console.log(`✅ Run completed with status: ${run.status}`);
    console.log(`🆔 Run ID: ${run.id}`);
    console.log(`💰 Compute units used: ${run.stats.computeUnits || 'N/A'}\n`);

    // Fetch results from the run's dataset
    console.log('📥 Fetching results...\n');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📊 Found ${items.length} properties\n`);
    console.log('═'.repeat(70) + '\n');

    // Display results
    items.forEach((property, index) => {
        console.log(`🏢 PROPERTY ${index + 1}:`);
        console.log('─'.repeat(70));

        console.log(`Title: ${property.title || property.name || 'N/A'}`);
        console.log(`Address: ${property.address || property.location || 'N/A'}`);

        // Check if it's for lease or sale
        console.log(`\n💰 PRICING:`);
        if (property.price || property.salePrice) {
            console.log(`   ⚠️  WARNING: This appears to be FOR SALE`);
            console.log(`   Sale Price: ${property.price || property.salePrice}`);
        }
        if (property.leaseRate || property.rent || property.rentalRate) {
            console.log(`   ✅ FOR LEASE`);
            console.log(`   Lease Rate: ${property.leaseRate || property.rent || property.rentalRate}`);
        }
        if (property.pricePerSqFt) {
            console.log(`   Price/SqFt: ${property.pricePerSqFt}`);
        }

        console.log(`\n📏 SIZE & TYPE:`);
        console.log(`   Size: ${property.size || property.squareFootage || property.sqft || 'N/A'}`);
        console.log(`   Type: ${property.propertyType || property.type || 'N/A'}`);
        console.log(`   Status: ${property.status || property.listingStatus || 'N/A'}`);

        // CRITICAL: Check for contact information
        console.log(`\n📞 CONTACT INFORMATION:`);
        if (property.agent) {
            console.log(`   ✅ Agent Found:`);
            console.log(`      Name: ${property.agent.name || 'N/A'}`);
            console.log(`      Email: ${property.agent.email || 'N/A'}`);
            console.log(`      Phone: ${property.agent.phone || 'N/A'}`);
            console.log(`      Company: ${property.agent.company || property.agent.brokerage || 'N/A'}`);
        } else if (property.contact) {
            console.log(`   ✅ Contact Found:`);
            console.log(`      Name: ${property.contact.name || property.contact.agentName || 'N/A'}`);
            console.log(`      Email: ${property.contact.email || 'N/A'}`);
            console.log(`      Phone: ${property.contact.phone || 'N/A'}`);
            console.log(`      Company: ${property.contact.company || 'N/A'}`);
        } else if (property.listingAgent) {
            console.log(`   ✅ Listing Agent Found:`);
            console.log(`      Name: ${property.listingAgent.name || 'N/A'}`);
            console.log(`      Email: ${property.listingAgent.email || 'N/A'}`);
            console.log(`      Phone: ${property.listingAgent.phone || 'N/A'}`);
        } else if (property.broker || property.brokerage) {
            console.log(`   ⚠️  Broker/Company Only:`);
            const broker = property.broker || property.brokerage;
            console.log(`      Company: ${broker.name || broker.company || 'N/A'}`);
            console.log(`      Phone: ${broker.phone || 'N/A'}`);
        } else {
            console.log(`   ❌ No contact information found`);
            console.log(`   Available fields: ${Object.keys(property).join(', ')}`);
        }

        if (property.url || property.listingUrl) {
            console.log(`\n🔗 URL: ${property.url || property.listingUrl}`);
        }

        console.log('\n' + '═'.repeat(70) + '\n');
    });

    // Save full results
    const fs = await import('fs');
    fs.writeFileSync(
        'loopnet_lease_results.json',
        JSON.stringify(items, null, 2)
    );
    console.log('✅ Full results saved to: loopnet_lease_results.json\n');

    // Analysis
    console.log('📊 ANALYSIS:\n');
    const leaseProperties = items.filter(p =>
        p.leaseRate || p.rent || p.rentalRate ||
        (p.title && p.title.toLowerCase().includes('lease'))
    );
    const saleProperties = items.filter(p =>
        p.price || p.salePrice ||
        (p.title && p.title.toLowerCase().includes('sale'))
    );
    const withContact = items.filter(p =>
        p.agent || p.contact || p.listingAgent || p.broker
    );

    console.log(`Total Properties: ${items.length}`);
    console.log(`Lease Properties: ${leaseProperties.length} (${(leaseProperties.length/items.length*100).toFixed(0)}%)`);
    console.log(`Sale Properties: ${saleProperties.length} (${(saleProperties.length/items.length*100).toFixed(0)}%)`);
    console.log(`With Contact Info: ${withContact.length} (${(withContact.length/items.length*100).toFixed(0)}%)`);

    if (leaseProperties.length === 0) {
        console.log('\n⚠️  WARNING: No lease properties found!');
        console.log('   The search URL may need adjustment to filter for leases only.');
    }

    if (withContact.length < items.length) {
        console.log(`\n⚠️  WARNING: ${items.length - withContact.length} properties missing contact info`);
    }

    console.log('\n✅ Test Complete!\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    if (error.statusCode === 404) {
        console.log('\n💡 The actor might not be accessible or the ID is incorrect.');
        console.log('   Available scrapers: memo23/apify-loopnet-search-cheerio, piotrv1001/loopnet-listings-scraper');
    }
}
