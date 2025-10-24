# Commercial Lease Search Requirements for Government RLPs

**Critical Information for Apify Property Searches**

---

## Understanding RLP (Request for Lease Proposal)

**RLP = Request for Lease Proposal** (NOT "Request for Proposal" for purchase)

Government agencies issue RLPs when they need to **lease commercial space** for:
- Office space for federal/state/local agencies
- Warehouses for equipment storage
- Data centers
- Training facilities
- Public service centers
- Administrative buildings

---

## Key Differences: Lease vs. Purchase Searches

### ❌ WRONG - Searching for Sale Properties:
```
"Find office properties for sale in Chicago, $500k-$2M"
```

### ✅ CORRECT - Searching for Lease Properties:
```
"Find office space available for LEASE in Chicago,
5,000-10,000 sq ft, $30-$45 per sq ft annually"
```

---

## Critical Lease-Specific Data Points

When searching LoopNet/Crexi, we MUST capture:

### **1. Lease Availability**
- ✅ **Available For:** Lease (NOT for sale)
- ✅ **Availability Status:** Available, Coming Soon, Pre-Leasing
- ✅ **Available Date:** Immediate, 30 days, 60 days, etc.

### **2. Lease Rates**
- ✅ **Annual Rate:** $35/sq ft/year (industry standard format)
- ✅ **Monthly Rent:** $21,875/month (easier for budgeting)
- ✅ **Rate Type:** Full Service Gross, Modified Gross, Triple Net (NNN)

### **3. Lease Terms**
- ✅ **Minimum Lease Term:** 3 years, 5 years, etc.
- ✅ **Maximum Lease Term:** 10 years, 15 years, etc.
- ✅ **Lease Type:** Full Service, Modified Gross, NNN
- ✅ **Renewal Options:** Available or not

### **4. What's Included in Lease**
- ✅ **Utilities Included:** Yes/No
- ✅ **Maintenance Included:** Building, HVAC, grounds
- ✅ **Property Taxes Included:** Yes (Full Service) or No (NNN)
- ✅ **Insurance Included:** Yes or tenant responsibility
- ✅ **CAM Charges:** Common Area Maintenance fees

### **5. Space Configuration**
- ✅ **Divisible:** Can be divided for smaller leases
- ✅ **Contiguous:** All space on one floor
- ✅ **Build-to-Suit:** Landlord will customize space
- ✅ **As-Is:** Current condition, no improvements

### **6. Move-In Costs**
- ✅ **Security Deposit:** Typically 1-3 months rent
- ✅ **First Month Rent:** Due at signing
- ✅ **Tenant Improvements (TI):** $ allowance from landlord
- ✅ **Broker Fees:** Who pays (typically landlord)

---

## Government Lease Requirements

Government agencies typically require:

### **Mandatory Requirements:**
1. **Security Clearances**
   - Background checks for contractors/maintenance
   - Restricted access areas
   - Security camera compliance

2. **ADA Compliance**
   - Full accessibility
   - Compliant restrooms
   - Accessible parking
   - Elevators (if multi-story)

3. **Safety/Fire Codes**
   - Sprinkler systems
   - Fire exits
   - Emergency lighting
   - Fire alarm systems

4. **Parking**
   - Sufficient spaces for staff
   - Visitor parking
   - Accessible parking spots

5. **Building Standards**
   - HVAC adequate for occupancy
   - Adequate electrical capacity
   - High-speed internet infrastructure
   - Backup power (for critical operations)

### **Preferred Features:**
- Ground floor access (for public-facing agencies)
- Proximity to public transportation
- Adequate loading/receiving areas
- Conference/meeting rooms
- Break rooms/kitchen facilities

---

## LoopNet Search Filters for Leases

### Essential Search Parameters:

```json
{
  "searchType": "lease",  // NOT "sale"
  "propertyType": "Office",
  "location": "Chicago, IL",
  "minSize": 5000,
  "maxSize": 10000,
  "minLeaseRate": 25,  // $/sq ft/year
  "maxLeaseRate": 45,  // $/sq ft/year
  "leaseType": ["Full Service Gross", "Modified Gross"],
  "minLeaseTerm": 5,  // years
  "availableNow": true,
  "parking": true,
  "elevatorAccess": true,
  "adaCompliant": true
}
```

---

## Example RLP Requirements → Search Criteria Mapping

### Example RLP Document Extract:

```
Agency: U.S. General Services Administration (GSA)
Need: Regional office space
Location: Chicago, IL - within 10 miles of downtown
Size: 7,500 sq ft
Occupancy: 50 employees
Parking: 30 spaces minimum
Budget: $300,000/year total occupancy cost
Lease Term: 5-10 years
Move-in Date: Within 90 days
Special Requirements:
- Ground floor preferred
- ADA compliant
- Security clearance required for building access
- Public transportation accessible
```

### Translated Search Criteria:

```json
{
  "location": {
    "city": "Chicago",
    "state": "IL",
    "radius": "10 miles",
    "centerPoint": "downtown Chicago"
  },
  "propertyType": "Office",
  "size": {
    "min": 7000,  // 7% buffer
    "max": 8000,  // 7% buffer
    "ideal": 7500
  },
  "lease": {
    "searchType": "lease",
    "minLeaseRate": 0,
    "maxLeaseRate": 40,  // $300k/7500 sq ft = $40/sq ft
    "leaseType": ["Full Service Gross"],  // Prefer all-inclusive
    "minTerm": 5,
    "maxTerm": 10,
    "availableWithin": "90 days"
  },
  "required": {
    "parking": 30,
    "adaCompliant": true,
    "elevator": true,
    "floors": ["Ground", "1st floor"]  // Ground floor preferred
  },
  "preferred": {
    "nearTransit": true,
    "securitySystem": true,
    "buildingAccess": "controlled"
  }
}
```

---

## Matching Algorithm Adjustments for Leases

### Scoring Criteria (100 points total):

**Location (25 points):**
- Within specified radius: 25 pts
- Per mile outside radius: -2 pts
- Near public transit: +3 bonus pts

**Lease Rate (25 points):**
- Within budget: 25 pts
- 10% over budget: 15 pts
- 20% over budget: 5 pts
- Over 20% budget: 0 pts

**Size (20 points):**
- Exact match (±5%): 20 pts
- Within range (±10%): 15 pts
- Within range (±20%): 10 pts
- Outside range: 0 pts

**Lease Terms (15 points):**
- Lease term matches requirement: 10 pts
- Lease type matches preference: 5 pts
- Flexible terms available: +3 bonus pts

**Required Features (15 points):**
- Each required feature present: +3 pts
- ADA compliance: +5 pts (mandatory)
- Parking meets minimum: +5 pts (mandatory)

**Bonus Points (up to +10):**
- Ground floor access: +5 pts
- Move-in ready: +3 pts
- Tenant improvement allowance: +2 pts

---

## Contact Information Priority for Leases

### Primary Contact:
**Leasing Agent** (not "listing agent" or "sales agent")
- Title: "Leasing Representative", "Leasing Specialist", "Tenant Representative"
- Direct line to leasing department
- Email specifically for lease inquiries

### Secondary Contact:
**Property Manager** or **Building Management**
- Can provide building specs
- Tour scheduling
- Tenant requirements discussion

### Tertiary Contact:
**Brokerage Firm - Leasing Division**
- Main office number
- Leasing department extension
- General leasing inquiries email

---

## Updated Test Query for Lease Search

### Correct Query Format:

```
"Search LoopNet for commercial office space available for LEASE:

Location: Chicago, IL (within 10 miles of downtown)
Property Type: Office
Size: 5,000 - 10,000 sq ft
Lease Rate: $25 - $45 per sq ft annually
Lease Type: Full Service Gross or Modified Gross
Minimum Lease Term: 5 years
Required Features:
- ADA compliant
- Parking available
- Elevator access
- Available within 90 days

Return top 5 matches with:
- Leasing agent name, email, phone
- Monthly and annual lease costs
- What's included in lease rate
- Lease terms available
- Move-in timeline
- Parking details
- Building amenities

IMPORTANT: Only return properties available for LEASE, not for sale."
```

---

## Common Lease Types Explained

### 1. **Full Service Gross (FSG)** / **Full Service Lease**
**Best for:** Government tenants (simplest)

**Includes:**
- ✅ Base rent
- ✅ Property taxes
- ✅ Building insurance
- ✅ Common area maintenance (CAM)
- ✅ Utilities (usually)
- ✅ Janitorial services (common areas)

**Tenant Pays:**
- ❌ Only rent (everything else included)

**Example:** $35/sq ft/year = $2,187.50/month for 750 sq ft
(No additional costs beyond monthly rent)

---

### 2. **Modified Gross Lease**
**Best for:** Predictable costs with some flexibility

**Includes:**
- ✅ Base rent
- ✅ Property taxes
- ✅ Building insurance
- ✅ Common area maintenance

**Tenant Pays:**
- 💰 Own utilities (electric, gas, water)
- 💰 Interior maintenance
- 💰 Janitorial (inside leased space)

**Example:** $30/sq ft/year + $500/month utilities

---

### 3. **Triple Net (NNN) Lease**
**Best for:** Long-term tenants, typically NOT preferred for government

**Includes:**
- ✅ Base rent only

**Tenant Pays:**
- 💰 Property taxes
- 💰 Building insurance
- 💰 Common area maintenance
- 💰 Utilities
- 💰 Repairs and maintenance

**Example:** $20/sq ft/year + $8/sq ft NNN charges = $28/sq ft total

**Note:** Government agencies typically prefer **Full Service Gross** for budget predictability.

---

## Database Schema Updates for Lease Properties

```sql
-- Update property_matches table for lease-specific fields
ALTER TABLE property_matches
ADD COLUMN available_for TEXT CHECK (available_for IN ('lease', 'sale', 'both')),
ADD COLUMN lease_rate_annual DECIMAL(10,2),  -- $ per sq ft per year
ADD COLUMN lease_rate_monthly DECIMAL(10,2),  -- $ per month
ADD COLUMN lease_type TEXT,  -- FSG, Modified Gross, NNN
ADD COLUMN lease_term_min INTEGER,  -- years
ADD COLUMN lease_term_max INTEGER,  -- years
ADD COLUMN available_date DATE,
ADD COLUMN security_deposit DECIMAL(10,2),
ADD COLUMN ti_allowance DECIMAL(10,2),  -- Tenant Improvement allowance
ADD COLUMN utilities_included BOOLEAN,
ADD COLUMN cam_charges DECIMAL(10,2),  -- Common Area Maintenance
ADD COLUMN parking_spaces INTEGER,
ADD COLUMN parking_cost DECIMAL(10,2),  -- per space per month
ADD COLUMN ada_compliant BOOLEAN,
ADD COLUMN divisible BOOLEAN,
ADD COLUMN build_to_suit BOOLEAN;

-- Create indexes for lease searches
CREATE INDEX idx_property_matches_lease ON property_matches(available_for) WHERE available_for = 'lease';
CREATE INDEX idx_property_matches_lease_rate ON property_matches(lease_rate_annual);
CREATE INDEX idx_property_matches_available_date ON property_matches(available_date);
```

---

## Frontend Display Updates for Lease Properties

### Property Card (Lease Version):

```
┌─────────────────────────────────────────────┐
│  Modern Office Space for Lease              │
│  123 Main St, Chicago, IL                   │
│  ─────────────────────────────────────────  │
│  Match Score: 95/100 ⭐⭐⭐⭐⭐            │
│  ─────────────────────────────────────────  │
│  💰 $2,600/month ($35/sq ft/yr)            │
│  📏 7,500 sq ft | 🏢 Office                 │
│  📅 Available: Immediate                    │
│  ─────────────────────────────────────────  │
│  📋 LEASE DETAILS                           │
│  Type: Full Service Gross                   │
│  Term: 5-10 years                           │
│  Includes: Utilities, taxes, maintenance    │
│  Parking: 30 spaces included                │
│  Security Deposit: $5,200 (2 months)        │
│  ─────────────────────────────────────────  │
│  📞 LEASING CONTACT                         │
│  👤 Sarah Johnson - Leasing Specialist     │
│  🏢 CBRE, Inc.                              │
│  📧 sjohnson@cbre.com                       │
│  📱 (312) 555-7890                          │
│  ─────────────────────────────────────────  │
│  [Request Lease Proposal] [Schedule Tour]  │
│  [Email Agent] [Call] [View Details]       │
└─────────────────────────────────────────────┘
```

---

## Updated Email Template Focus

Key changes for government lease inquiries:

1. **Subject Line:** "Government Lease Inquiry - RLP..." (not "Interest in Property")
2. **Opening:** Clarify it's for government use
3. **Requirements:** Emphasize lease terms, not purchase
4. **Requests:** Lease proposal, building specs, security requirements
5. **Timeline:** Government procurement timelines
6. **Compliance:** Mention need for government lease standards

---

## Important Notes for Testing

### When Testing Apify Scrapers:

1. **Specify "for lease"** in all searches
2. **Filter out sale properties** entirely
3. **Prioritize lease rate data** over sale prices
4. **Capture lease-specific fields:**
   - Lease type (FSG, Modified Gross, NNN)
   - Lease terms available
   - What's included in rent
   - Available date
   - Divisibility options

5. **Look for leasing contacts** specifically:
   - "Leasing Agent"
   - "Tenant Representative"
   - "Leasing Specialist"
   - NOT "Sales Agent" or "Listing Agent"

---

## Success Criteria for Lease Searches

### ✅ Successful Lease Match:

```json
{
  "property": {
    "availableFor": "lease",  // NOT "sale"
    "leaseRate": {
      "annual": 35,  // per sq ft
      "monthly": 21875,  // total
      "type": "Full Service Gross"
    },
    "leaseTerm": {
      "min": 5,
      "max": 10,
      "flexible": true
    },
    "whatsIncluded": [
      "utilities",
      "property taxes",
      "building insurance",
      "CAM",
      "janitorial (common areas)"
    ]
  },
  "contact": {
    "leasingAgent": "Sarah Johnson",
    "title": "Senior Leasing Representative",
    "department": "Office Leasing Division"
  }
}
```

---

## Common Pitfalls to Avoid

### ❌ DON'T:
- Search for "properties for sale"
- Use "price" instead of "lease rate"
- Contact "sales agents" for lease inquiries
- Calculate based on purchase price
- Use residential lease terminology

### ✅ DO:
- Search explicitly for "lease" or "for rent"
- Use "lease rate" ($/sq ft/year)
- Contact "leasing agents" or "tenant reps"
- Calculate monthly occupancy costs
- Use commercial lease terminology

---

## Quick Reference: Lease vs. Sale Terminology

| ❌ Sale Terms | ✅ Lease Terms |
|--------------|----------------|
| Price | Lease Rate / Rent |
| Purchase | Lease / Rent |
| Sales Agent | Leasing Agent |
| Buyer | Tenant |
| Closing | Lease Commencement |
| Down Payment | Security Deposit |
| Mortgage | Monthly Rent |
| For Sale | For Lease / Available |

---

## Final Checklist for Apify Integration

Before going live, verify:

- [ ] Searches explicitly filter for "lease" properties
- [ ] Lease rates displayed (not sale prices)
- [ ] Lease terms captured (min/max years)
- [ ] Lease type identified (FSG, Modified, NNN)
- [ ] Leasing agent contact (not sales agent)
- [ ] Monthly rent calculated correctly
- [ ] What's included in rent is clear
- [ ] Available date captured
- [ ] Parking details included
- [ ] ADA compliance noted
- [ ] Email template is government-focused
- [ ] RLP terminology used throughout

---

**Last Updated:** 2025-10-23

**Status:** Ready for Lease-Focused Testing

**Next Action:** Test Apify with lease-specific search criteria!
