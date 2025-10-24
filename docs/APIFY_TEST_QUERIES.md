# Apify MCP Test Queries & Contact Information Guide

Complete guide for testing Apify MCP server and ensuring we capture agent/broker contact information for **commercial lease** property matches.

**IMPORTANT:** RLP = **Request for Lease Proposal**
This tool is designed for government agencies seeking to **lease** commercial properties, NOT purchase them.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Contact Information Requirements](#contact-information-requirements)
- [Available Scrapers with Contact Data](#available-scrapers-with-contact-data)
- [Test Query Sequence](#test-query-sequence)
- [Expected Output Format](#expected-output-format)
- [Integration Requirements](#integration-requirements)

---

## Prerequisites

✅ Apify MCP server configured in `.mcp.local.json`
✅ Claude Code restarted to load MCP server
✅ Apify API token active with credits available

---

## Contact Information Requirements

### Critical Contact Fields Needed:

For each matched **lease** property, government users need to be able to contact the listing agent or leasing representative. We must extract:

**Primary Contact Info:**
- ✅ **Agent Name** - Full name of leasing agent/representative
- ✅ **Agent Phone** - Direct phone number
- ✅ **Agent Email** - Direct email address
- ✅ **Brokerage/Company** - Commercial real estate firm
- ✅ **Company Phone** - Office phone number
- ✅ **Leasing Contact** - Dedicated leasing department contact (if different from listing agent)

**Secondary Contact Info (Nice to Have):**
- Agent profile URL
- Agent photo
- Agent license information
- Social media links (LinkedIn, etc.)
- Years of experience
- Specialties/certifications

---

## Available Scrapers with Contact Data

### 1. LoopNet Search Scraper (Recommended for Contact Info)

**Actor ID:** `memo23/apify-loopnet-search-cheerio`

**Title:** "LoopNet | Search | Property(ies) | Agent(s) | Bypasses Limits"

**Why This One:**
- ✅ Explicitly designed to extract **Agent(s)** data
- ✅ Bypasses LoopNet's typical scraping limits
- ✅ Extracts both property details AND agent profiles

**Extracts:**
- Agent name
- Agent email (often in "title" field: `mark@markfilipenko.com`)
- Agent company
- Agent jobTitle
- Agent organization
- Agent profile URL
- Agent photo URL
- Agent specialties
- Agent licenses
- Agent social links
- All agent's active listings

**Output Structure:**
```json
{
  "property": {
    "title": "Office Space for Lease - Downtown Chicago",
    "leaseRate": "$35/sq ft/year" or "$21,875/month",
    "squareFootage": 7500,
    "availableFor": "Lease",
    "offeredBy": {
      "name": "Mark Filipenko",
      "jobTitle": "Senior Broker",
      "organization": "Bond Filipenko Commercial Properties",
      "email": "mark@markfilipenko.com",
      "phone": "(312) 555-0123",
      "profileUrl": "https://www.loopnet.com/profile/..."
    }
  }
}
```

---

### 2. LoopNet Listings Scraper (Alternative)

**Actor ID:** `piotrv1001/loopnet-listings-scraper`

**Extracts:**
- Price, location, images
- Property description
- Listing agent details (name, contact info)
- Investment highlights

**Note:** Contact info extraction confirmed but specific field structure needs testing.

---

### 3. Crexi Scraper (Broker Profiles)

**Actor ID:** `memo23/apify-crexi`

**Extracts:**
- Property listings
- **Broker profiles** with full contact information
- Market insights

**Best For:** Properties with detailed broker information on Crexi platform.

---

## Test Query Sequence

### Phase 1: Verify MCP Server Connection

**After restarting Claude Code, ask:**

```
Test Query 1: Check Apify Connection
─────────────────────────────────────
"Can you verify the Apify MCP server is connected and working?"
```

**Expected Response:**
- Claude confirms Apify MCP server is active
- Lists available tools (actors, docs)

---

### Phase 2: Discover Real Estate Scrapers

```
Test Query 2: Find Commercial Real Estate Actors
─────────────────────────────────────────────────
"Search for all available Apify actors related to:
1. LoopNet commercial property scraping
2. Commercial real estate listings
3. Broker and agent contact information

List the actor names, IDs, and what they extract."
```

**Expected Response:**
- List of LoopNet scrapers
- Crexi scraper
- Description of what each extracts
- Which ones provide contact information

---

### Phase 3: Get Actor Details (Contact Info Verification)

```
Test Query 3A: LoopNet Search Scraper Details
──────────────────────────────────────────────
"Show me detailed information about the actor:
memo23/apify-loopnet-search-cheerio

Specifically, I need to know:
1. What contact information does it extract for agents/brokers?
2. What are the exact field names for agent email, phone, and name?
3. What's the input format required?
4. What does the output JSON structure look like?"
```

```
Test Query 3B: LoopNet Listings Scraper Details
────────────────────────────────────────────────
"Show me detailed information about the actor:
piotrv1001/loopnet-listings-scraper

Specifically:
1. Does it extract listing agent contact information?
2. What contact fields are available (email, phone, etc.)?
3. Show me an example output structure."
```

```
Test Query 3C: Crexi Scraper Details
────────────────────────────────────
"Show me detailed information about the actor:
memo23/apify-crexi

Focus on:
1. Broker profile extraction capabilities
2. Contact information fields available
3. How to access broker details from property listings"
```

**Expected Response:**
- Detailed actor documentation
- Input schema (required parameters)
- Output schema (all available fields)
- Example JSON output with contact fields highlighted

---

### Phase 4: Run Sample Property Search (WITH Contact Info)

```
Test Query 4: Search Chicago Office Lease Properties
─────────────────────────────────────────────────────
"Using the LoopNet scraper that includes agent contact information,
search for LEASE properties (not for sale):

Location: Chicago, IL
Property Type: Office Space for Lease
Size Range: 5,000 - 10,000 sq ft
Lease Type: Full-service lease or Modified gross
Max Results: 5 properties

IMPORTANT: Make sure the output includes:
- Listing agent name
- Agent email address
- Agent phone number
- Brokerage/company name

Show me the results with all contact information clearly displayed."
```

**Expected Output:**
```json
[
  {
    "property": {
      "title": "Premium Office Space for Lease - Loop District",
      "address": "123 W Madison St, Chicago, IL 60602",
      "availableFor": "Lease",
      "leaseRate": "$38/sq ft/year",
      "monthlyRent": "$24,700/month",
      "leaseType": "Full Service Gross",
      "leaseTerm": "5-10 years",
      "availableDate": "Immediate",
      "squareFootage": 7800,
      "propertyType": "Office",
      "description": "Modern office space with stunning views...",
      "images": ["url1", "url2"],
      "location": {
        "latitude": 41.8819,
        "longitude": -87.6278
      }
    },
    "contact": {
      "leasingAgent": "Sarah Johnson",
      "agentTitle": "Senior Leasing Representative",
      "agentEmail": "sjohnson@cbre.com",
      "agentPhone": "(312) 555-7890",
      "company": "CBRE, Inc.",
      "companyPhone": "(312) 555-0100",
      "leasingDepartment": "(312) 555-0150",
      "profileUrl": "https://www.loopnet.com/profile/12345-sarah-johnson"
    },
    "listingUrl": "https://www.loopnet.com/listing/...",
    "listingDate": "2025-10-15",
    "listingStatus": "Active"
  }
]
```

---

### Phase 5: Verify Contact Info Completeness

```
Test Query 5: Analyze Contact Data Quality
───────────────────────────────────────────
"From the 5 properties we just searched, analyze:

1. How many properties have complete contact information?
   (agent name, email, AND phone)

2. What contact fields are missing for any properties?

3. Are there alternative ways to contact the listing agent if
   direct contact info is not available?

4. Can we extract the brokerage company phone as a backup
   contact method?"
```

**Expected Response:**
- Breakdown of contact data completeness
- Identification of any missing fields
- Suggestions for fallback contact methods
- Confirmation that we can display brokerage info as backup

---

### Phase 6: Test Alternative Contact Methods

```
Test Query 6: Broker Profile Lookup
────────────────────────────────────
"For one of the properties from our search, can you:

1. Get the full broker/agent profile information
2. Extract ALL available contact methods (email, phone, social media)
3. Show me any additional contact options like:
   - Contact form URLs
   - Office addresses
   - Alternative agents at the same company"
```

---

## Expected Output Format

### Ideal Property Match Object (with Contact Info):

```json
{
  "matchId": "uuid-here",
  "rlpDocumentId": 123,
  "matchScore": 95,
  "property": {
    "title": "Modern Office Building",
    "address": "123 Main St",
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "price": 1750000,
    "pricePerSqFt": 233.33,
    "squareFootage": 7500,
    "propertyType": "Office",
    "zoning": "Commercial",
    "yearBuilt": 2015,
    "description": "Premium office space...",
    "features": [
      "Parking (50 spaces)",
      "Elevator",
      "Central HVAC",
      "High-speed internet ready"
    ],
    "images": [
      "https://photos.loopnet.com/..."
    ],
    "location": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "contact": {
    "primary": {
      "type": "Listing Agent",
      "name": "Sarah Johnson",
      "title": "Senior Broker",
      "email": "sjohnson@cbre.com",
      "phone": "(312) 555-7890",
      "phoneExt": null,
      "mobile": "(312) 555-7891",
      "profileUrl": "https://www.loopnet.com/profile/sarah-johnson",
      "photoUrl": "https://photos.loopnet.com/agent/sarah.jpg"
    },
    "company": {
      "name": "CBRE, Inc.",
      "phone": "(312) 555-0100",
      "email": "info@cbre.com",
      "website": "https://www.cbre.com",
      "address": "321 N Clark St, Chicago, IL 60654"
    },
    "alternativeContacts": [
      {
        "type": "Co-Broker",
        "name": "Michael Chen",
        "email": "mchen@cbre.com",
        "phone": "(312) 555-7892"
      }
    ],
    "contactMethods": [
      "email",
      "phone",
      "company_phone",
      "profile_message"
    ]
  },
  "listing": {
    "listingId": "12345678",
    "listingUrl": "https://www.loopnet.com/listing/12345678",
    "listingDate": "2025-10-15",
    "listingStatus": "Active",
    "daysOnMarket": 15,
    "source": "LoopNet"
  },
  "matchDetails": {
    "locationScore": 25,
    "typeScore": 20,
    "sizeScore": 18,
    "priceScore": 19,
    "featuresScore": 13,
    "totalScore": 95,
    "matchReasons": [
      "✅ Within 5 miles of target location",
      "✅ Exact property type match (Office)",
      "✅ Size within ideal range (7,500 sq ft)",
      "✅ Price within budget ($1.75M)",
      "✅ Has 3 of 4 required features"
    ]
  }
}
```

---

## Integration Requirements

### Database Schema Updates

**Add to `property_matches` table:**

```sql
-- Add contact information columns
ALTER TABLE property_matches
ADD COLUMN contact_data JSONB,
ADD COLUMN agent_name TEXT,
ADD COLUMN agent_email TEXT,
ADD COLUMN agent_phone TEXT,
ADD COLUMN company_name TEXT,
ADD COLUMN company_phone TEXT,
ADD COLUMN listing_url TEXT;

-- Create index for contact lookups
CREATE INDEX idx_property_matches_agent_email ON property_matches(agent_email);
CREATE INDEX idx_property_matches_company_name ON property_matches(company_name);
```

---

### Frontend Contact Display Requirements

**Property Card Component should show:**

```
┌─────────────────────────────────────────────┐
│  Modern Office Building                     │
│  123 Main St, Chicago, IL                   │
│  ─────────────────────────────────────────  │
│  Match Score: 95/100 ⭐⭐⭐⭐⭐            │
│  ─────────────────────────────────────────  │
│  💰 $1,750,000 | 📏 7,500 sq ft            │
│  🏢 Office | 🅿️ 50 parking spaces          │
│  ─────────────────────────────────────────  │
│  📞 CONTACT LISTING AGENT                   │
│  ─────────────────────────────────────────  │
│  👤 Sarah Johnson                           │
│  🏢 CBRE, Inc.                              │
│  📧 sjohnson@cbre.com                       │
│  📱 (312) 555-7890                          │
│  ─────────────────────────────────────────  │
│  [Email Agent] [Call Agent] [View Profile] │
│  [View Full Details] [Save Property]       │
└─────────────────────────────────────────────┘
```

**Contact Actions:**
1. **Email Agent** - Opens mailto: link with pre-filled template
2. **Call Agent** - Opens tel: link for mobile users
3. **View Profile** - Opens agent profile in new tab
4. **View Full Details** - Expands property details panel

---

### Email Template (Pre-filled for Government Users)

When user clicks "Email Agent", pre-fill with:

```
To: sjohnson@cbre.com
Subject: Government Lease Inquiry - RLP for Office Space at 123 Main St, Chicago

Dear Sarah Johnson,

I am contacting you on behalf of [Government Agency Name] regarding your
available office space for lease at:

123 Main St, Chicago, IL 60601

Property Details from Listing:
- Lease Rate: $38/sq ft/year ($24,700/month)
- Size: 7,500 sq ft
- Type: Office Space
- Listing: https://www.loopnet.com/listing/12345678

This property matches requirements from our Request for Lease Proposal (RLP).

We are seeking to lease commercial office space for government use with the
following requirements:
- Lease Term: [X] years
- Occupancy Date Needed: [Date]
- Security/Access Requirements: Government-compliant
- Parking Requirements: [X] spaces

I would like to:
☐ Schedule a property tour
☐ Request lease proposal and terms
☐ Discuss government lease requirements
☐ Receive information about building security and accessibility
☐ Obtain comparable available properties

Government Agency Information:
Agency: [Agency Name]
Contact Name: [User will fill in]
Title: [User will fill in]
Email: [User will fill in]
Phone: [User will fill in]
Department: [User will fill in]

Best Time to Contact: [User will fill in]

Please note: This inquiry is for a government lease. We will require:
- Compliance with government lease standards
- Security clearances for contractors (if applicable)
- ADA compliance verification
- Standard government lease terms and conditions

Thank you for your prompt attention to this matter.

Sent via [Your App Name] - Government RLP Property Matching Tool
```

---

## Validation Checks

### Required Contact Fields (Priority Order):

**Must Have (Block save if missing):**
1. Agent Name OR Company Name (at least one)
2. Agent Email OR Company Phone (at least one contact method)

**Should Have (Show warning if missing):**
3. Agent Phone
4. Company Name (if only agent name present)
5. Listing URL (for more info)

**Nice to Have (Optional):**
6. Agent Photo
7. Agent Profile URL
8. Multiple contact methods
9. Co-broker information

---

### Error Handling

**Scenario 1: No Contact Info Available**
```
⚠️ Warning: Contact information not available for this property.
Alternative Actions:
- View listing on source website
- Search for property address on Google
- Contact source platform directly (LoopNet, Crexi)
```

**Scenario 2: Partial Contact Info**
```
ℹ️ Limited contact information available.
Available: Company Name, Company Phone
Missing: Agent Email
Action: Use company phone as primary contact method.
```

**Scenario 3: Outdated Listing**
```
⚠️ This listing may be outdated (90+ days on market).
Recommendation: Verify listing status before contacting agent.
[Refresh Listing Data]
```

---

## Test Success Criteria

### ✅ Tests Pass If:

1. **Connection Test:** Apify MCP server responds to queries
2. **Actor Discovery:** At least 2 LoopNet scrapers found with contact capabilities
3. **Contact Extraction:** Sample search returns agent name, email, AND phone for 80%+ of properties
4. **Data Structure:** Output matches expected JSON format
5. **Completeness:** Each property has at least 2 contact methods available
6. **Fallback:** Company contact info available when agent info is missing

### ❌ Tests Fail If:

1. MCP server not responding
2. Scrapers don't extract contact information
3. Less than 50% of properties have any contact info
4. No email addresses available for any agents
5. Data structure doesn't match schema

---

## Additional Test Scenarios

### Test Query 7: Multi-Location Search

```
"Search for commercial properties in:
1. Chicago, IL (Office, 5,000-10,000 sq ft)
2. New York, NY (Retail, 3,000-7,000 sq ft)
3. Los Angeles, CA (Warehouse, 10,000-20,000 sq ft)

For each location, return top 3 matches WITH contact information.
Ensure all agent emails and phone numbers are captured."
```

---

### Test Query 8: Contact Information Quality Report

```
"Analyze the quality of contact information across all 9 properties:

1. How many have direct agent emails?
2. How many have agent phone numbers?
3. What % have BOTH email and phone?
4. Which scraper (LoopNet vs Crexi) provides better contact data?
5. Are there any properties with NO contact info at all?

Provide a detailed breakdown and recommendations."
```

---

### Test Query 9: Backup Contact Methods

```
"For any properties missing direct agent contact info,
show me what alternative contact methods are available:

1. Company/brokerage contact information
2. Property listing URLs with contact forms
3. Agent profile pages
4. Alternative agents at the same company

Create a fallback strategy for each property."
```

---

## Performance Benchmarks

### Target Metrics:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Properties with agent name | 95%+ | 80-95% | <80% |
| Properties with agent email | 90%+ | 70-90% | <70% |
| Properties with agent phone | 85%+ | 65-85% | <65% |
| Properties with 2+ contact methods | 80%+ | 60-80% | <60% |
| Search completion time | <30s | 30-60s | >60s |
| Contact info accuracy | 95%+ | 85-95% | <85% |

---

## Next Steps After Testing

### If Tests Pass:

1. ✅ Document which scraper(s) work best for contact info
2. ✅ Update database schema with contact fields
3. ✅ Build backend API endpoint for property search
4. ✅ Design frontend contact display components
5. ✅ Implement email/call action handlers
6. ✅ Add contact info validation
7. ✅ Create user-facing contact forms

### If Tests Fail:

1. 🔍 Identify which contact fields are missing
2. 🔄 Try alternative scrapers (Crexi, other LoopNet actors)
3. 🛠️ Consider combining data from multiple sources
4. 📞 Add manual contact info entry as fallback
5. 🔗 At minimum, provide listing URLs for users to contact via platform

---

## Resources

### Apify Actors to Test:

1. **memo23/apify-loopnet-search-cheerio** - Primary (includes agents)
2. **piotrv1001/loopnet-listings-scraper** - Backup
3. **memo23/apify-crexi** - Alternative source
4. **getdataforme/loopnet-scraper** - Another option

### Apify Documentation:

- Actor API: https://docs.apify.com/api/v2#/reference/actors
- MCP Integration: https://docs.apify.com/platform/integrations/mcp
- Output Schema: https://docs.apify.com/api/v2#/reference/datasets

---

## Priority Action Items

### Immediate (Before Restart):
- ✅ Configuration complete
- ✅ Test queries prepared
- ✅ Expected output documented

### After Restart (Testing):
1. 🔴 **HIGH:** Verify contact info extraction works
2. 🔴 **HIGH:** Confirm at least email OR phone available
3. 🟡 **MEDIUM:** Test multiple scrapers to compare contact data
4. 🟡 **MEDIUM:** Validate data structure matches schema
5. 🟢 **LOW:** Optimize for speed and cost

---

**Ready to restart Claude Code and begin testing!**

Once you're back, we'll run through these test queries systematically to ensure we can capture all necessary contact information for your users.

---

**Last Updated:** 2025-10-23

**Status:** Ready for Testing
