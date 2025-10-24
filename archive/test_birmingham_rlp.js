// Test script for GSA RLP No. 8AL2178 - Birmingham, AL Office Space
// Real RLP Requirements: 3,900-4,200 sq ft office space with 3 parking spaces

import { ApifyClient } from 'apify-client';
import fs from 'fs';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  GSA RLP No. 8AL2178 - Birmingham, AL Office Space Search  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// RLP Requirements from document 8AL2178
const rlpRequirements = {
    solicitation: '8AL2178',
    location: {
        city: 'Birmingham',
        state: 'Alabama',
        delineatedArea: 'See Exhibit N'
    },
    space: {
        minSqFt: 3900,
        maxSqFt: 4200,
        type: 'Office',
        measurement: 'ABOA' // American Building Owners Association standard
    },
    parking: {
        total: 3,
        types: ['Surface', 'Structured']
    },
    leaseTerm: {
        fullTerm: 120, // months (10 years)
        firmTerm: 60   // months (5 years)
    },
    specialRequirements: [
        'Right to affix antenna to roof/building',
        'Fully serviced lease required',
        'Must not be in 1% flood plain'
    ],
    occupancyDate: '2026-09-13',
    offersDue: '2025-10-22',
    contact: {
        name: 'Jared Hebner',
        email: 'jared.hebner@gsa.gov',
        phone: '(617) 283-2580'
    }
};

console.log('📋 RLP REQUIREMENTS:');
console.log('─'.repeat(62));
console.log(`Solicitation: ${rlpRequirements.solicitation}`);
console.log(`Location: ${rlpRequirements.location.city}, ${rlpRequirements.location.state}`);
console.log(`Size: ${rlpRequirements.space.minSqFt.toLocaleString()}-${rlpRequirements.space.maxSqFt.toLocaleString()} sq ft (${rlpRequirements.space.measurement})`);
console.log(`Type: ${rlpRequirements.space.type}`);
console.log(`Parking: ${rlpRequirements.parking.total} spaces (${rlpRequirements.parking.types.join(' or ')})`);
console.log(`Lease Term: ${rlpRequirements.leaseTerm.fullTerm} months (${rlpRequirements.leaseTerm.fullTerm/12} years)`);
console.log(`Firm Term: ${rlpRequirements.leaseTerm.firmTerm} months (${rlpRequirements.leaseTerm.firmTerm/12} years)`);
console.log(`\nSpecial Requirements:`);
rlpRequirements.specialRequirements.forEach(req => console.log(`  • ${req}`));
console.log(`\nOccupancy Date: ${rlpRequirements.occupancyDate}`);
console.log(`Offers Due: ${rlpRequirements.offersDue}`);
console.log('');

// Premium scraper configuration
const actorId = 'memo23/apify-loopnet-search-cheerio';

// Search URL for Birmingham, AL office space FOR LEASE
// Filtering for size range 3,900-4,200 sq ft
const searchUrl = 'https://www.loopnet.com/search/office-space/birmingham-al/for-lease/3900-sqft/4200-sqft/';

const input = {
    "startUrls": [
        { "url": searchUrl }
    ],
    "maxItems": 20,  // Get more results for better matching
    "proxyConfiguration": {
        "useApifyProxy": true
    }
};

console.log('🔍 SEARCH PARAMETERS:');
console.log('─'.repeat(62));
console.log(`Scraper: ${actorId}`);
console.log(`Search URL: ${searchUrl}`);
console.log(`Max Items: ${input.maxItems}`);
console.log('');

console.log('🚀 Starting property search...\n');
console.log('⏳ This may take 30-60 seconds...\n');

async function runSearch() {
try {
    // Run the actor
    const run = await client.actor(actorId).call(input);

    console.log(`✅ Search completed!`);
    console.log(`Status: ${run.status}`);
    console.log(`Duration: ${run.stats.runTimeSecs} seconds`);
    console.log(`Compute units: ${run.stats.computeUnits}`);
    console.log('');

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log('═'.repeat(62));
    console.log(`📊 SEARCH RESULTS: ${items.length} properties found\n`);

    if (items.length === 0) {
        console.log('⚠️  No properties found matching search criteria.');
        console.log('   Try expanding search area or adjusting size range.\n');
        return;
    }

    // Function to calculate match score
    function calculateMatchScore(property) {
        let score = 0;
        const reasons = [];

        // Parse square footage (remove commas)
        const sqft = parseInt(property.squareFootage?.replace(/,/g, '') || '0');

        // Size match (30 points)
        if (sqft >= rlpRequirements.space.minSqFt && sqft <= rlpRequirements.space.maxSqFt) {
            score += 30;
            reasons.push('✅ Size matches exactly');
        } else if (sqft > 0) {
            const deviation = Math.abs(sqft - (rlpRequirements.space.minSqFt + rlpRequirements.space.maxSqFt) / 2);
            const deviationPercent = (deviation / rlpRequirements.space.minSqFt) * 100;

            if (deviationPercent <= 10) {
                score += 25;
                reasons.push(`✅ Size within 10% of target (${deviationPercent.toFixed(0)}% off)`);
            } else if (deviationPercent <= 20) {
                score += 20;
                reasons.push(`⚠️  Size within 20% of target (${deviationPercent.toFixed(0)}% off)`);
            } else if (deviationPercent <= 30) {
                score += 15;
                reasons.push(`⚠️  Size within 30% of target (${deviationPercent.toFixed(0)}% off)`);
            } else {
                reasons.push(`❌ Size outside acceptable range (${deviationPercent.toFixed(0)}% off)`);
            }
        } else {
            reasons.push('⚠️  Size not specified');
        }

        // Property type (25 points)
        if (property.propertyType === 'Office') {
            score += 25;
            reasons.push('✅ Property type: Office');
        } else if (property.propertyType) {
            reasons.push(`⚠️  Property type: ${property.propertyType} (not Office)`);
        } else {
            reasons.push('⚠️  Property type not specified');
        }

        // Location match - Birmingham, AL (25 points)
        if (property.city?.toLowerCase() === 'birmingham' && property.state === 'AL') {
            score += 25;
            reasons.push('✅ Location: Birmingham, AL');
        } else {
            reasons.push(`⚠️  Location: ${property.city}, ${property.state}`);
        }

        // Listing type - FOR LEASE (10 points)
        if (property.listingType && !property.listingType.toLowerCase().includes('sale')) {
            score += 10;
            reasons.push('✅ Available for lease');
        } else if (property.listingType) {
            reasons.push(`⚠️  Listing type: ${property.listingType}`);
        }

        // Has broker contact (5 points)
        if (property.brokerCompany) {
            score += 5;
            reasons.push(`✅ Broker: ${property.brokerCompany}`);
        } else {
            reasons.push('⚠️  No broker information');
        }

        // Has listing URL (5 points)
        if (property.listingUrl) {
            score += 5;
            reasons.push('✅ Listing URL available');
        }

        return { score, reasons };
    }

    // Score and sort properties
    const scoredProperties = items.map(property => {
        const { score, reasons } = calculateMatchScore(property);
        return { ...property, matchScore: score, matchReasons: reasons };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Display top matches
    console.log('🏆 TOP MATCHES (sorted by match score):\n');
    console.log('═'.repeat(62));

    scoredProperties.forEach((property, index) => {
        const stars = '⭐'.repeat(Math.ceil(property.matchScore / 20));

        console.log(`\n${index + 1}. Match Score: ${property.matchScore}/100 ${stars}`);
        console.log('─'.repeat(62));

        console.log(`\n📍 LOCATION:`);
        console.log(`   Address: ${property.address || 'N/A'}`);
        console.log(`   City: ${property.city || 'N/A'}, ${property.state || 'N/A'} ${property.zip || ''}`);

        console.log(`\n📏 PROPERTY DETAILS:`);
        console.log(`   Type: ${property.propertyType || 'N/A'}`);
        console.log(`   Size: ${property.squareFootage || 'N/A'} sq ft`);
        console.log(`   Listing Type: ${property.listingType || 'N/A'}`);

        const sqft = parseInt(property.squareFootage?.replace(/,/g, '') || '0');
        if (sqft >= rlpRequirements.space.minSqFt && sqft <= rlpRequirements.space.maxSqFt) {
            console.log(`   ✅ SIZE MATCH for RLP ${rlpRequirements.solicitation}`);
        }

        console.log(`\n📞 CONTACT INFORMATION:`);
        if (property.brokerCompany) {
            console.log(`   Broker: ${property.brokerCompany}`);
            console.log(`   📝 Full contact info available at listing URL`);
        } else {
            console.log(`   ⚠️  Contact information: See listing URL`);
        }

        console.log(`\n🔗 LISTING:`);
        console.log(`   URL: ${property.listingUrl || 'N/A'}`);
        console.log(`   Property ID: ${property.propertyId || 'N/A'}`);

        if (property.images && property.images.length > 0) {
            console.log(`\n📸 Images: ${property.images.length} available`);
        }

        console.log(`\n🎯 MATCH ANALYSIS:`);
        property.matchReasons.forEach(reason => {
            console.log(`   ${reason}`);
        });

        console.log('\n' + '═'.repeat(62));
    });

    // Summary statistics
    console.log('\n📊 SUMMARY:\n');
    const excellentMatches = scoredProperties.filter(p => p.matchScore >= 80);
    const goodMatches = scoredProperties.filter(p => p.matchScore >= 60 && p.matchScore < 80);
    const fairMatches = scoredProperties.filter(p => p.matchScore >= 40 && p.matchScore < 60);

    console.log(`Total Properties Found: ${items.length}`);
    console.log(`Excellent Matches (80-100): ${excellentMatches.length}`);
    console.log(`Good Matches (60-79): ${goodMatches.length}`);
    console.log(`Fair Matches (40-59): ${fairMatches.length}`);
    console.log('');

    // Save results
    const results = {
        rlp: rlpRequirements,
        searchParameters: {
            scraper: actorId,
            searchUrl,
            maxItems: input.maxItems
        },
        runStats: {
            status: run.status,
            duration: run.stats.runTimeSecs,
            computeUnits: run.stats.computeUnits
        },
        summary: {
            totalProperties: items.length,
            excellentMatches: excellentMatches.length,
            goodMatches: goodMatches.length,
            fairMatches: fairMatches.length
        },
        properties: scoredProperties
    };

    fs.writeFileSync(
        'birmingham_rlp_results.json',
        JSON.stringify(results, null, 2)
    );
    console.log('✅ Full results saved to: birmingham_rlp_results.json\n');

    // Next steps
    console.log('📋 NEXT STEPS:\n');
    console.log('1. Review top matches above');
    console.log('2. Visit listing URLs to get full contact information');
    console.log('3. Contact brokers to request lease proposals');
    console.log('4. Verify special requirements:');
    console.log('   • Right to affix antenna');
    console.log('   • Fully serviced lease terms');
    console.log('   • Not in 1% flood plain');
    console.log('5. Submit offers by: ' + rlpRequirements.offersDue);
    console.log('');

    if (excellentMatches.length > 0) {
        console.log('🎉 SUCCESS: Found excellent matches for RLP ' + rlpRequirements.solicitation);
    } else if (goodMatches.length > 0) {
        console.log('✅ Found good matches for RLP ' + rlpRequirements.solicitation);
    } else {
        console.log('⚠️  Limited matches found. Consider expanding search criteria.');
    }
    console.log('');

} catch (error) {
    console.error('❌ Error:', error.message);
    if (error.statusCode === 402) {
        console.log('\n💡 The 2-hour trial may have expired.');
        console.log('   Activate the $29/month subscription to continue.');
    }
}
}

// Run the search
runSearch();
