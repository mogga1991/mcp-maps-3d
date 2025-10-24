# Apify MCP Integration Plan for RLP Property Matching

Complete guide for integrating Apify's MCP server to automatically find commercial real estate properties that match RLP requirements.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [What is Apify MCP?](#what-is-apify-mcp)
- [Available Commercial Real Estate Scrapers](#available-commercial-real-estate-scrapers)
- [Setup Instructions](#setup-instructions)
- [Integration Architecture](#integration-architecture)
- [RLP Matching Workflow](#rlp-matching-workflow)
- [Implementation Plan](#implementation-plan)
- [Cost Analysis](#cost-analysis)
- [Next Steps](#next-steps)

---

## Executive Summary

**Goal:** Automatically find commercial real estate properties that match requirements from uploaded RLP documents.

**Solution:** Integrate Apify's MCP server to access commercial property scrapers (LoopNet, Crexi) and use AI to match properties against extracted RLP requirements.

**Key Benefits:**
- 🔍 Access to thousands of commercial property listings
- 🤖 AI-powered requirement matching
- 💰 Cost-effective ($1.20 per 1,000 listings)
- ⚡ Real-time data extraction
- 🔄 No daily API limits

---

## What is Apify MCP?

**Apify Model Context Protocol (MCP) Server** enables AI assistants like Claude to directly access Apify's library of web scrapers and automation tools.

### Key Features

1. **Dynamic Tool Discovery** - AI agents can find and use scrapers on-demand
2. **OAuth Authentication** - Secure, token-free connection
3. **Hosted Service** - No local setup required
4. **Thousands of Ready-Made Scrapers** - Including commercial real estate tools
5. **Real-Time Data** - Extract current property listings on demand

### How It Works

```
User uploads RLP document
    ↓
AI extracts requirements (location, size, budget, type)
    ↓
AI uses Apify MCP to search for matching properties
    ↓
Scrapers pull real-time data from LoopNet/Crexi
    ↓
AI matches properties to RLP requirements
    ↓
Results displayed on 3D map with matching score
```

---

## Available Commercial Real Estate Scrapers

### 1. LoopNet Listings Scraper

**Actor ID:** `piotrv1001/loopnet-listings-scraper`

**What It Extracts:**
- ✅ Property price
- ✅ Location (address, city, state, coordinates)
- ✅ Square footage
- ✅ Property type (office, retail, industrial, etc.)
- ✅ Listing status
- ✅ High-definition images
- ✅ Property description
- ✅ Investment highlights
- ✅ Executive summary
- ✅ Listing agent details
- ✅ Attachments (spec sheets, PDFs)
- ✅ Tax properties
- ✅ Zone information

**Pricing:** $1.20 per 1,000 listings

**Best For:** Comprehensive US commercial property data

---

### 2. Crexi.com Scraper

**Actor ID:** `memo23/apify-crexi`

**What It Extracts:**
- ✅ Property listings
- ✅ Broker profiles
- ✅ Market insights
- ✅ Investment opportunities
- ✅ Deal-making data

**Best For:** Commercial real estate investment and brokerage data

---

### 3. Zoopla Commercial Properties Scraper

**Actor ID:** `dhrumil/zoopla-commercial-properties-scraper`

**Coverage:** United Kingdom commercial properties

**Features:**
- ✅ Sale and rent listings
- ✅ Monitor specific listings for updates
- ✅ Millions of UK properties

**Best For:** UK commercial real estate market

---

### 4. Alternative Scrapers

- **LoopNet Search (Bypasses Limits)** - `memo23/apify-loopnet-search-cheerio`
- **Realtor.com Commercial** - For mixed residential/commercial
- **Custom Search URLs** - Input specific search criteria

---

## Setup Instructions

### Prerequisites

1. Apify account (free tier available)
2. Apify API token
3. Claude Code (already installed)
4. Node.js 18+ (already installed ✅)

---

### Step 1: Get Apify API Token

1. Go to https://console.apify.com/
2. Sign up or log in
3. Navigate to **Settings** → **Integrations**
4. Click **Generate new API token**
5. Name it "MCP Server"
6. Copy the token (starts with `apify_api_`)

---

### Step 2: Add Apify MCP Server to Configuration

**Option A: Hosted Service (Recommended)**

Update `.mcp.local.json`:

```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "your_neon_api_key"
      }
    },
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase-community/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key"
      }
    },
    "apify": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@apify/actors-mcp-server",
        "--tools",
        "actors,docs"
      ],
      "env": {
        "APIFY_TOKEN": "your_apify_token_here"
      },
      "description": "Apify MCP server - Access commercial real estate scrapers and web automation tools"
    }
  }
}
```

**Option B: Hosted Endpoint (For Claude.ai)**

If using Claude.ai web interface, connect to:
- **URL:** `https://mcp.apify.com`
- **Auth:** OAuth (no token needed)
- **Tools:** `?tools=actors,docs,apify/rag-web-browser`

---

### Step 3: Restart Claude Code

After updating `.mcp.local.json`, restart Claude Code to load the new MCP server.

---

### Step 4: Verify Installation

In Claude Code, ask:

```
Can you search for available Apify actors related to commercial real estate?
```

**Expected Response:**
Claude should be able to list LoopNet, Crexi, and other commercial property scrapers.

---

## Integration Architecture

### Current System

```
User → Frontend Upload → Backend API → Supabase Storage
                                    ↓
                              Gemini AI (Extract RLP)
                                    ↓
                              Neon Database (Store)
```

### Enhanced System with Apify

```
User → Frontend Upload → Backend API → Supabase Storage
                                    ↓
                              Gemini AI (Extract RLP)
                                    ↓
                              Neon Database (Store Requirements)
                                    ↓
                              Claude + Apify MCP
                                    ↓
                        Search Commercial Properties
                              (LoopNet, Crexi)
                                    ↓
                              AI Matching Engine
                              (Score properties)
                                    ↓
                          Display on 3D Map + Results
```

---

## RLP Matching Workflow

### Phase 1: Extract Requirements from RLP

When user uploads RLP document:

1. **Extract key requirements:**
   - Location (city, state, zip, radius)
   - Property type (office, retail, industrial, warehouse, etc.)
   - Size range (min/max square footage)
   - Budget range (min/max price)
   - Specific features (parking, loading docks, zoning, etc.)
   - Timeline requirements

2. **Store in database:**
   ```sql
   UPDATE rlp_documents
   SET requirements = {
     "location": "Chicago, IL",
     "radius": "10 miles",
     "propertyType": "office",
     "minSize": 5000,
     "maxSize": 10000,
     "minPrice": 500000,
     "maxPrice": 2000000,
     "features": ["parking", "elevator", "central_hvac"],
     "zoning": "commercial"
   }
   WHERE id = ?
   ```

---

### Phase 2: Search for Properties

Using Apify MCP, Claude can:

1. **Build search query:**
   ```
   "Find commercial office properties in Chicago, IL
    between 5,000-10,000 sq ft, priced $500k-$2M"
   ```

2. **Call LoopNet scraper:**
   ```javascript
   // Claude uses MCP to call this automatically
   {
     "actorId": "piotrv1001/loopnet-listings-scraper",
     "input": {
       "searchUrl": "https://www.loopnet.com/search/...",
       "maxListings": 50
     }
   }
   ```

3. **Receive property data:**
   ```json
   [
     {
       "title": "Modern Office Space - Downtown Chicago",
       "price": 1750000,
       "squareFootage": 7500,
       "propertyType": "Office",
       "location": {
         "address": "123 Main St",
         "city": "Chicago",
         "state": "IL",
         "zip": "60601",
         "latitude": 41.8781,
         "longitude": -87.6298
       },
       "description": "Premium office space with parking...",
       "features": ["parking", "elevator", "hvac"],
       "images": ["url1", "url2"],
       "listingAgent": { ... }
     }
   ]
   ```

---

### Phase 3: AI-Powered Matching

Claude analyzes each property against RLP requirements:

**Matching Criteria:**
- ✅ Location match (within radius)
- ✅ Property type match
- ✅ Size within range
- ✅ Price within budget
- ✅ Required features present
- ✅ Zoning compliance

**Scoring System (0-100):**
- **Location:** 25 points (exact city, within radius)
- **Property Type:** 20 points (exact match)
- **Size:** 20 points (within range, closer to ideal = higher score)
- **Price:** 20 points (within budget, better value = higher score)
- **Features:** 15 points (% of required features present)

**Example Output:**
```json
{
  "rlpDocumentId": 123,
  "matchedProperties": [
    {
      "property": { ... },
      "matchScore": 95,
      "matchDetails": {
        "location": { "score": 25, "reason": "Within 5 miles of target" },
        "propertyType": { "score": 20, "reason": "Exact match: Office" },
        "size": { "score": 18, "reason": "7,500 sq ft (target: 5,000-10,000)" },
        "price": { "score": 19, "reason": "$1.75M (budget: $500k-$2M)" },
        "features": { "score": 13, "reason": "3/4 required features present" }
      }
    }
  ]
}
```

---

### Phase 4: Display Results

**Frontend Enhancements:**

1. **Property Markers on 3D Map:**
   - Green pins: High match (90-100%)
   - Yellow pins: Medium match (70-89%)
   - Red pins: Low match (50-69%)

2. **Property Card Display:**
   ```
   ┌─────────────────────────────────────┐
   │  Modern Office Space                │
   │  123 Main St, Chicago, IL           │
   │  ───────────────────────────────────│
   │  Match Score: 95/100 ⭐⭐⭐⭐⭐      │
   │  ───────────────────────────────────│
   │  💰 $1,750,000                      │
   │  📏 7,500 sq ft                     │
   │  🏢 Office                          │
   │  ✅ Parking, Elevator, HVAC         │
   │  ───────────────────────────────────│
   │  [View Details] [Contact Agent]    │
   └─────────────────────────────────────┘
   ```

3. **Side-by-Side Comparison:**
   - RLP requirements on left
   - Matched properties on right
   - Visual comparison of features

---

## Implementation Plan

### Timeline: 2-3 Days

---

### Day 1: Setup & Testing

**Tasks:**
1. ✅ Get Apify API token
2. ✅ Add Apify MCP server to `.mcp.local.json`
3. ✅ Restart Claude Code
4. ✅ Test actor discovery and execution
5. ✅ Run sample LoopNet scraper

**Testing:**
```
Ask Claude:
"Search for commercial office properties in Chicago
using the LoopNet scraper. Show me 5 results."
```

---

### Day 2: Backend Integration

**Tasks:**

1. **Create Property Matching Service:**
   - `backend/src/services/propertyMatcher.js`
   - Functions:
     - `searchProperties(rlpRequirements)`
     - `scorePropertyMatch(property, requirements)`
     - `rankProperties(properties, requirements)`

2. **Add API Endpoint:**
   ```javascript
   // backend/src/routes/properties.js
   router.post('/api/search-properties', async (req, res) => {
     const { rlpDocumentId } = req.body;

     // Get RLP requirements from database
     const rlp = await getRlpDocument(rlpDocumentId);

     // Use Claude + Apify MCP to search
     const properties = await searchProperties(rlp.requirements);

     // Score and rank matches
     const rankedProperties = await rankProperties(
       properties,
       rlp.requirements
     );

     res.json({ properties: rankedProperties });
   });
   ```

3. **Store Matched Properties:**
   ```sql
   CREATE TABLE IF NOT EXISTS property_matches (
     id SERIAL PRIMARY KEY,
     rlp_document_id INTEGER REFERENCES rlp_documents(id),
     property_data JSONB NOT NULL,
     match_score INTEGER NOT NULL,
     match_details JSONB,
     source TEXT DEFAULT 'loopnet',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

---

### Day 3: Frontend Integration

**Tasks:**

1. **Add Property Search Button:**
   ```javascript
   // frontend/src/components/RlpViewer.jsx
   <button onClick={handleSearchProperties}>
     🔍 Find Matching Properties
   </button>
   ```

2. **Display Results on Map:**
   ```javascript
   // frontend/src/components/Map3D.jsx
   {matchedProperties.map(property => (
     <PropertyMarker
       key={property.id}
       position={[property.location.longitude, property.location.latitude]}
       matchScore={property.matchScore}
       data={property}
     />
   ))}
   ```

3. **Property Details Panel:**
   - Show property info
   - Display match breakdown
   - Link to listing source
   - Contact agent button

---

## Cost Analysis

### Apify Pricing

**Free Tier:**
- $5 free credits monthly
- ~4,166 listings free per month
- Sufficient for testing and small-scale use

**Pay-As-You-Go:**
- $1.20 per 1,000 listings
- No subscription required
- No daily limits

**Example Costs:**

| RLP Documents/Month | Properties per RLP | Total Listings | Monthly Cost |
|---------------------|-------------------|----------------|--------------|
| 10                  | 50                | 500            | $0.60        |
| 50                  | 50                | 2,500          | $3.00        |
| 100                 | 50                | 5,000          | $6.00        |
| 500                 | 50                | 25,000         | $30.00       |

**Additional Costs:**
- Neon Database: Free tier (3GB storage)
- Supabase: Free tier (1GB storage, 50MB bandwidth)
- Gemini API: Free tier (15 requests/minute)

**Total Estimated Monthly Cost:**
- Development: $0 (free tiers)
- Production (100 RLPs/month): ~$6-10

---

## Next Steps

### Immediate Actions

1. **Get Apify Account:**
   - Sign up at https://console.apify.com/
   - Generate API token
   - Test in Apify Console

2. **Add to MCP Configuration:**
   - Update `.mcp.local.json`
   - Restart Claude Code
   - Verify connection

3. **Test Property Search:**
   - Ask Claude to search LoopNet
   - Verify data extraction
   - Review output format

---

### Phase 1: MVP (Week 1)

**Goal:** Basic property search and display

**Features:**
- ✅ Manual property search via Claude
- ✅ Display results on map
- ✅ Basic matching score
- ✅ Property details panel

---

### Phase 2: Automation (Week 2)

**Goal:** Automatic matching on RLP upload

**Features:**
- ✅ Auto-search on RLP processing
- ✅ Store matched properties in database
- ✅ Email notifications for matches
- ✅ Match score algorithm refinement

---

### Phase 3: Advanced Features (Week 3-4)

**Goal:** Production-ready matching system

**Features:**
- ✅ Multiple scraper support (LoopNet + Crexi)
- ✅ Saved searches and alerts
- ✅ Property comparison tool
- ✅ Agent contact integration
- ✅ Property visit scheduling
- ✅ Analytics dashboard

---

## Technical Considerations

### Rate Limiting

**Apify MCP Server:**
- 30 requests per second per user
- Implement retry logic for 429 responses

**Best Practices:**
- Batch property searches
- Cache results for 24 hours
- Implement exponential backoff

---

### Data Storage

**Strategy:**
- Store raw property data in `property_matches` table
- Cache frequently accessed listings
- Expire old matches after 30 days
- Index by location for fast queries

---

### Error Handling

**Scenarios:**
1. **Scraper unavailable:** Fallback to alternative scraper
2. **No matches found:** Suggest broader search criteria
3. **API quota exceeded:** Queue for later processing
4. **Invalid RLP requirements:** Request manual review

---

### Security

**Considerations:**
- ✅ Store Apify token in environment variables
- ✅ Never expose token in frontend
- ✅ Rate limit property search API
- ✅ Sanitize user inputs to scrapers
- ✅ Validate property data before storage

---

## Success Metrics

### KPIs to Track

1. **Match Quality:**
   - Average match score for accepted properties
   - % of RLPs with >80% matches
   - User satisfaction ratings

2. **Performance:**
   - Property search time (target: <30 seconds)
   - Properties found per RLP (target: 10-50)
   - API success rate (target: >95%)

3. **Cost Efficiency:**
   - Cost per RLP processed
   - Scraper utilization rate
   - API credit usage

---

## Alternatives Considered

### Option 1: Direct API Integration (LoopNet, Crexi)

**Pros:**
- Direct access to official APIs
- Potentially more stable

**Cons:**
- ❌ No public APIs available (most CRE sites don't offer APIs)
- ❌ Expensive commercial licenses ($1,000+/month)
- ❌ Rate limits and restrictions
- ❌ Separate integration for each source

**Verdict:** Not viable for MVP

---

### Option 2: Build Custom Scrapers

**Pros:**
- Full control over extraction
- No third-party costs

**Cons:**
- ❌ Time-intensive development (weeks)
- ❌ Maintenance burden (sites change)
- ❌ Legal/ToS concerns
- ❌ Anti-scraping measures

**Verdict:** Too much overhead for MVP

---

### Option 3: Manual Property Entry

**Pros:**
- Simple implementation
- No API costs

**Cons:**
- ❌ Not scalable
- ❌ Time-consuming for users
- ❌ Defeats automation purpose

**Verdict:** Not aligned with product vision

---

### **Selected: Apify MCP Integration**

**Why It Wins:**
- ✅ Ready-made scrapers (no development time)
- ✅ Low cost ($1.20 per 1,000 listings)
- ✅ AI-native integration (MCP protocol)
- ✅ Multiple data sources (LoopNet, Crexi, etc.)
- ✅ Maintained by community
- ✅ Legal and compliant
- ✅ Easy to test and iterate

---

## Resources

### Documentation

- **Apify MCP Server:** https://docs.apify.com/platform/integrations/mcp
- **GitHub Repo:** https://github.com/apify/apify-mcp-server
- **LoopNet Scraper:** https://apify.com/piotrv1001/loopnet-listings-scraper
- **Crexi Scraper:** https://apify.com/memo23/apify-crexi
- **MCP Protocol:** https://modelcontextprotocol.io

### Apify Console

- **Dashboard:** https://console.apify.com/
- **API Tokens:** https://console.apify.com/account/integrations
- **Actor Store:** https://apify.com/store

### Support

- **Apify Discord:** https://discord.com/invite/jyEM2PRvMU
- **MCP GitHub:** https://github.com/anthropics/mcp
- **Apify Blog:** https://blog.apify.com/

---

## Conclusion

Integrating Apify's MCP server provides a **cost-effective, scalable solution** for automatically finding commercial real estate properties that match RLP requirements.

**Key Advantages:**
1. 🚀 Fast implementation (2-3 days)
2. 💰 Low cost ($1.20 per 1,000 listings)
3. 🤖 AI-native integration (works seamlessly with Claude)
4. 📊 Rich property data (price, size, location, features)
5. 🔄 Multiple data sources (LoopNet, Crexi, Zoopla)
6. ⚡ Real-time data extraction

**Next Action:** Get Apify API token and update `.mcp.local.json` to start testing!

---

**Last Updated:** 2025-10-23

**Questions?** Check the [Setup Instructions](#setup-instructions) or refer to the official Apify MCP documentation.
