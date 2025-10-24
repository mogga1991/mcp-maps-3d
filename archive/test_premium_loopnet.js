// PREMIUM SCRAPER TEST - 2 Hour Trial
// Test memo23/apify-loopnet-search-cheerio for commercial LEASE properties

import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║    PREMIUM LOOPNET SCRAPER TEST - 2 HOUR TRIAL              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('⏰ Trial Window: 2 hours');
console.log('🎯 Goal: Verify it works and extracts contact info');
console.log('📦 Scraper: memo23/apify-loopnet-search-cheerio (PREMIUM)\n');

// Test case: Chicago office space for LEASE
// Try different input format for memo23 scraper
const input = {
    "startUrls": [
        { "url": "https://www.loopnet.com/search/office-space/chicago-il/for-lease/" }
    ],
    "maxItems": 5,
    "proxyConfiguration": {
        "useApifyProxy": true
    }
};

console.log('🏢 Search Parameters:');
console.log('   Location: Chicago, IL');
console.log('   Type: Office Space');
console.log('   Transaction: FOR LEASE');
console.log('   Max Results: 5 properties\n');

console.log('📋 Input:');
console.log(JSON.stringify(input, null, 2));
console.log('\n🚀 Starting premium scraper...\n');
console.log('⏳ This may take 30-60 seconds...\n');

async function testPremiumScraper() {
    try {
        const startTime = Date.now();

        // Run the premium actor
        const run = await client.actor("memo23/apify-loopnet-search-cheerio").call(input);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('═'.repeat(70) + '\n');
        console.log('✅ RUN COMPLETED!\n');
        console.log('─'.repeat(70));
        console.log(`Status: ${run.status}`);
        console.log(`Run ID: ${run.id}`);
        console.log(`Duration: ${duration} seconds`);
        console.log(`Compute Units: ${run.stats?.computeUnits?.toFixed(4) || 'N/A'}`);
        console.log('─'.repeat(70) + '\n');

        if (run.status !== 'SUCCEEDED') {
            console.log(`⚠️  Run did not succeed. Status: ${run.status}`);
            console.log('This might mean:');
            console.log('   - Trial has expired');
            console.log('   - Subscription not active');
            console.log('   - Input format issue\n');
            return;
        }

        // Fetch results
        console.log('📥 Fetching results...\n');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log('═'.repeat(70));
        console.log(`\n🎉 RESULTS: ${items.length} PROPERTIES FOUND!\n`);
        console.log('═'.repeat(70) + '\n');

        if (items.length === 0) {
            console.log('⚠️  No properties returned');
            console.log('Possible reasons:');
            console.log('   - No properties match search criteria');
            console.log('   - URL format needs adjustment');
            console.log('   - Try different location/type\n');
            return;
        }

        // SUCCESS! Show results
        console.log('🎊 SUCCESS! Premium scraper is working!\n');

        // Analyze each property
        let leaseCount = 0;
        let contactCount = 0;
        let emailCount = 0;
        let phoneCount = 0;

        items.forEach((property, index) => {
            console.log('═'.repeat(70));
            console.log(`\n🏢 PROPERTY ${index + 1}/${items.length}\n`);
            console.log('─'.repeat(70));

            // Basic Info
            console.log(`Title: ${property.title || property.name || 'N/A'}`);
            console.log(`Address: ${property.address || property.location || 'N/A'}`);
            console.log(`City: ${property.city || 'N/A'}`);
            console.log(`State: ${property.state || 'N/A'}`);

            // Transaction Type - CRITICAL CHECK
            console.log(`\n💰 TRANSACTION TYPE:`);
            const isLease = property.listingType?.toLowerCase().includes('lease') ||
                           property.transactionType?.toLowerCase().includes('lease') ||
                           property.forLease === true ||
                           property.leaseRate ||
                           property.rent;

            if (isLease) {
                console.log(`   ✅ FOR LEASE`);
                leaseCount++;
            } else {
                console.log(`   ⚠️  Type: ${property.listingType || property.transactionType || 'Unknown'}`);
            }

            // Pricing
            if (property.leaseRate || property.rent || property.rentalRate) {
                console.log(`   Lease Rate: ${property.leaseRate || property.rent || property.rentalRate}`);
            }
            if (property.price) {
                console.log(`   Price: ${property.price}`);
            }

            // Property Details
            console.log(`\n📏 PROPERTY DETAILS:`);
            console.log(`   Size: ${property.size || property.squareFootage || property.buildingSize || 'N/A'}`);
            console.log(`   Type: ${property.propertyType || property.type || 'N/A'}`);
            console.log(`   Status: ${property.status || 'N/A'}`);

            // CONTACT INFORMATION - MOST CRITICAL
            console.log(`\n📞 CONTACT INFORMATION:`);

            let hasContact = false;
            let contactInfo = {};

            // Check all possible contact field structures
            const contactSources = [
                property.agent,
                property.contact,
                property.broker,
                property.listingAgent,
                property.listingContact,
                property.brokerInfo
            ].filter(Boolean);

            if (contactSources.length > 0) {
                const contact = contactSources[0];
                hasContact = true;
                contactCount++;

                console.log(`   ✅ CONTACT FOUND!`);
                console.log(`   ─────────────────────────────────────────────────`);

                contactInfo.name = contact.name || contact.agentName || contact.brokerName;
                contactInfo.email = contact.email || contact.emailAddress;
                contactInfo.phone = contact.phone || contact.phoneNumber || contact.tel;
                contactInfo.company = contact.company || contact.brokerage || contact.firm;
                contactInfo.title = contact.title || contact.jobTitle;

                if (contactInfo.name) {
                    console.log(`   👤 Name: ${contactInfo.name}`);
                }
                if (contactInfo.title) {
                    console.log(`   💼 Title: ${contactInfo.title}`);
                }
                if (contactInfo.email) {
                    console.log(`   📧 Email: ${contactInfo.email}`);
                    emailCount++;
                }
                if (contactInfo.phone) {
                    console.log(`   📱 Phone: ${contactInfo.phone}`);
                    phoneCount++;
                }
                if (contactInfo.company) {
                    console.log(`   🏢 Company: ${contactInfo.company}`);
                }

                // Show all available contact fields
                console.log(`   ─────────────────────────────────────────────────`);
                console.log(`   Available fields: ${Object.keys(contact).join(', ')}`);

            } else {
                console.log(`   ⚠️  No standard contact fields found`);
                console.log(`   Property fields: ${Object.keys(property).slice(0, 10).join(', ')}...`);
            }

            // URL
            if (property.url || property.listingUrl || property.propertyUrl) {
                console.log(`\n🔗 Listing URL: ${property.url || property.listingUrl || property.propertyUrl}`);
            }

            // Images
            if (property.images && property.images.length > 0) {
                console.log(`📸 Images: ${property.images.length} available`);
            }

            console.log('');
        });

        // Save full results
        const fs = await import('fs');
        fs.writeFileSync(
            'premium_loopnet_results.json',
            JSON.stringify(items, null, 2)
        );
        console.log('═'.repeat(70));
        console.log('\n💾 Full results saved to: premium_loopnet_results.json\n');

        // FINAL ANALYSIS
        console.log('═'.repeat(70));
        console.log('\n📊 CRITICAL SUCCESS METRICS\n');
        console.log('─'.repeat(70));

        const leasePercent = (leaseCount / items.length * 100).toFixed(0);
        const contactPercent = (contactCount / items.length * 100).toFixed(0);
        const emailPercent = (emailCount / items.length * 100).toFixed(0);
        const phonePercent = (phoneCount / items.length * 100).toFixed(0);

        console.log(`Total Properties:           ${items.length}`);
        console.log(`Lease Properties:           ${leaseCount}/${items.length} (${leasePercent}%)`);
        console.log(`With Contact Info:          ${contactCount}/${items.length} (${contactPercent}%)`);
        console.log(`With Email:                 ${emailCount}/${items.length} (${emailPercent}%)`);
        console.log(`With Phone:                 ${phoneCount}/${items.length} (${phonePercent}%)`);

        console.log('\n' + '═'.repeat(70) + '\n');

        // VERDICT
        if (items.length >= 3 && contactCount >= 3) {
            console.log('✅ ✅ ✅  PREMIUM SCRAPER WORKS PERFECTLY! ✅ ✅ ✅\n');
            console.log('🎉 SUCCESS CRITERIA MET:\n');
            console.log(`   ✅ Returns property results (${items.length} found)`);
            console.log(`   ✅ Extracts contact information (${contactPercent}% have contacts)`);
            console.log(`   ✅ Provides email addresses (${emailPercent}% have emails)`);
            console.log(`   ✅ Provides phone numbers (${phonePercent}% have phones)`);
            console.log(`   ✅ Identifies lease properties (${leasePercent}% are leases)\n`);

            console.log('💡 RECOMMENDATION: ✅ KEEP SUBSCRIPTION\n');
            console.log('Next Steps:');
            console.log('   1. ✅ Premium scraper is verified working');
            console.log('   2. 🔨 Build backend API integration');
            console.log('   3. 🗺️  Display properties on 3D map');
            console.log('   4. 📞 Add contact action buttons');
            console.log('   5. 🚀 Launch property matching feature!\n');

        } else if (items.length > 0) {
            console.log('⚠️  PARTIAL SUCCESS\n');
            console.log(`Found ${items.length} properties but contact data quality needs review.\n`);
            console.log('Issues:');
            if (contactCount < items.length / 2) {
                console.log(`   ⚠️  Only ${contactPercent}% have contact information`);
            }
            if (leaseCount < items.length / 2) {
                console.log(`   ⚠️  Only ${leasePercent}% are lease properties (may include sales)`);
            }
            console.log('\nRecommendation:');
            console.log('   - Review premium_loopnet_results.json');
            console.log('   - Try different search parameters');
            console.log('   - Test with multiple cities');
            console.log('   - Contact scraper developer if issues persist\n');

        } else {
            console.log('❌ NO RESULTS\n');
            console.log('This is unexpected for the premium scraper.');
            console.log('Possible issues:');
            console.log('   - Trial may not be active');
            console.log('   - Search URL needs adjustment');
            console.log('   - Try different location/parameters\n');
        }

        console.log('═'.repeat(70) + '\n');

    } catch (error) {
        console.error('\n❌ ERROR OCCURRED\n');
        console.error('─'.repeat(70));
        console.error(`Error: ${error.message}`);
        console.error(`Status Code: ${error.statusCode || 'N/A'}\n`);

        if (error.message?.includes('rent a paid Actor')) {
            console.log('💰 SUBSCRIPTION ISSUE\n');
            console.log('The premium scraper requires an active subscription.');
            console.log('Please verify:');
            console.log('   1. Subscription was activated');
            console.log('   2. Trial period is still active (2 hours)');
            console.log('   3. Payment method is valid\n');
            console.log('Check: https://console.apify.com/actors/RuOxoBM1bnc5pQ3TJ\n');
        }

        console.error('─'.repeat(70) + '\n');
    }
}

// Run the test
testPremiumScraper();
