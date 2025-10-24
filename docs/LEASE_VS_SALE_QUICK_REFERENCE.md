# Quick Reference: Lease vs. Sale Property Searches

**CRITICAL:** Your RLP tool is for **LEASING** properties, NOT purchasing them!

---

## ❌ WRONG - Sale Property Search

```
Search Query:
"Find office properties FOR SALE in Chicago, priced $500,000 - $2,000,000"

Results You'd Get:
- Properties listed for purchase
- Sale prices ($1.5M, $1.8M, etc.)
- Sales agents
- Purchase terms
- Financing options
```

**This is NOT what government agencies need!**

---

## ✅ CORRECT - Lease Property Search

```
Search Query:
"Find office space available FOR LEASE in Chicago,
5,000-10,000 sq ft, $25-$45 per sq ft annually"

Results You Need:
- Properties available for rent/lease
- Lease rates ($35/sq ft/year or $2,600/month)
- Leasing agents / tenant representatives
- Lease terms (5-10 years)
- Monthly occupancy costs
```

**This is what your users need!**

---

## Key Terminology Differences

| Sale (DON'T USE) | Lease (USE THIS) |
|------------------|------------------|
| For Sale | For Lease / Available for Rent |
| Price: $1,500,000 | Rent: $35/sq ft/year or $2,600/month |
| Sales Agent | Leasing Agent / Tenant Rep |
| Buyer | Tenant |
| Purchase Agreement | Lease Agreement |
| Closing Costs | Security Deposit + First Month |
| Mortgage Payment | Monthly Rent |
| Down Payment | Security Deposit (1-3 months rent) |
| Property Taxes | Included (FSG) or Separate (NNN) |

---

## Government Lease Context

### What is an RLP?

**RLP = Request for Lease Proposal**

Government agencies (federal, state, local) issue RLPs when they need to:
- Lease office space for employees
- Rent warehouse space for equipment
- Secure data center facilities
- Obtain training facilities
- Find public service center locations

### Who Uses This Tool?

- **GSA (General Services Administration)** - Federal government leasing
- **State government** procurement departments
- **County/city** facilities management
- **Government contractors** helping with space acquisition

### What They Need:

1. **Commercial space for LEASE** (not purchase)
2. **Lease terms** of 5-10+ years typically
3. **Predictable costs** (prefer Full Service Gross leases)
4. **Compliance** with government standards (ADA, security, etc.)
5. **Contact with leasing agents** to submit proposals

---

## Sample Apify Test Query (CORRECTED)

### Test After Restarting Claude Code:

```
"Using LoopNet scraper, search for commercial office space available FOR LEASE:

Location: Chicago, IL
Property Type: Office Space for Lease
Size Range: 5,000 - 10,000 sq ft
Lease Rate Range: $25 - $45 per sq ft annually
Lease Type: Full Service Gross preferred
Minimum Lease Term: 5 years

MUST RETURN:
- Properties FOR LEASE ONLY (exclude sales)
- Lease rates (annual and monthly)
- Leasing agent contact information
- Lease terms available
- What's included in rent
- Parking availability
- Available move-in date

Return top 5 matches with complete contact info for leasing representatives."
```

---

## How Lease Rates Work

### Example Property:

**7,500 sq ft office space**
**Lease Rate: $35/sq ft/year**
**Lease Type: Full Service Gross**

**Monthly Rent Calculation:**
```
7,500 sq ft × $35/sq ft/year = $262,500/year
$262,500 ÷ 12 months = $21,875/month
```

**What's Included (Full Service Gross):**
- ✅ Base rent
- ✅ Property taxes
- ✅ Building insurance
- ✅ Common area maintenance
- ✅ Utilities (usually)
- ✅ Janitorial (common areas)

**Tenant Pays:**
- Nothing additional! (It's "full service")

**Move-In Costs:**
- First month rent: $21,875
- Security deposit (2 months): $43,750
- **Total to move in: $65,625**

---

## Database Fields for Leases

Make sure to capture these lease-specific fields:

```json
{
  "availableFor": "lease",  // NOT "sale"!
  "leaseRate": {
    "annual": 35,  // per sq ft per year
    "monthly": 21875,  // total monthly rent
    "type": "Full Service Gross"
  },
  "leaseTerm": {
    "minimum": 5,  // years
    "maximum": 10,  // years
    "flexible": true
  },
  "includes": [
    "utilities",
    "property taxes",
    "insurance",
    "CAM",
    "janitorial"
  ],
  "availableDate": "2025-11-01",
  "securityDeposit": 43750,  // typically 2-3 months rent
  "parkingSpaces": 30,
  "parkingCost": 0,  // included or separate cost
  "contact": {
    "leasingAgent": "Sarah Johnson",
    "title": "Senior Leasing Representative",
    "email": "sjohnson@cbre.com",
    "phone": "(312) 555-7890",
    "company": "CBRE, Inc.",
    "department": "Office Leasing Division"
  }
}
```

---

## Visual Comparison

### Sale Property Card (WRONG):
```
┌───────────────────────────┐
│ Office Building FOR SALE │
│ $1,750,000               │ ← Purchase price
│ 7,500 sq ft              │
│                          │
│ Contact: Sales Agent     │ ← Wrong contact type
│ financing available      │ ← Not relevant
└───────────────────────────┘
```

### Lease Property Card (CORRECT):
```
┌────────────────────────────────┐
│ Office Space FOR LEASE        │
│ $21,875/month                 │ ← Monthly rent
│ ($35/sq ft/year)              │ ← Annual rate
│ 7,500 sq ft                   │
│                               │
│ Lease: 5-10 years             │ ← Lease terms
│ Type: Full Service Gross      │ ← What's included
│ Available: Immediate          │ ← Move-in date
│                               │
│ Contact: Leasing Agent        │ ← Correct contact
│ Request Lease Proposal        │ ← Correct action
└────────────────────────────────┘
```

---

## Testing Checklist

Before going live, verify:

- [ ] Search query specifies "FOR LEASE" not "for sale"
- [ ] Results show lease rates, not sale prices
- [ ] Contact is leasing agent, not sales agent
- [ ] Lease terms are displayed (5-10 years, etc.)
- [ ] Lease type is identified (FSG, Modified, NNN)
- [ ] Monthly rent is calculated correctly
- [ ] What's included in rent is clear
- [ ] Email template mentions "lease inquiry" not "purchase"
- [ ] Frontend shows "Request Lease Proposal" button
- [ ] All terminology uses lease/rent (not buy/purchase)

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Searching Sale Properties
**Wrong:** "Find properties for $500k-$2M"
**Right:** "Find properties for lease at $25-$45/sq ft/year"

### ❌ Mistake 2: Showing Sale Prices
**Wrong:** "This property costs $1.5M"
**Right:** "This property leases for $2,600/month"

### ❌ Mistake 3: Wrong Contact Type
**Wrong:** "Contact: John Smith - Sales Agent"
**Right:** "Contact: Sarah Johnson - Leasing Representative"

### ❌ Mistake 4: Wrong Action Buttons
**Wrong:** [Make an Offer] [Apply for Mortgage]
**Right:** [Request Lease Proposal] [Schedule Tour]

### ❌ Mistake 5: Purchase Terminology
**Wrong:** "Purchase this property for your agency"
**Right:** "Lease this property for your agency"

---

## Quick Reference for Developers

### Property Type Filter:
```javascript
// ❌ WRONG
const searchParams = {
  type: "sale",
  priceMin: 500000,
  priceMax: 2000000
}

// ✅ CORRECT
const searchParams = {
  type: "lease",  // or "for-rent"
  leaseRateMin: 25,  // $/sq ft/year
  leaseRateMax: 45   // $/sq ft/year
}
```

### Display Format:
```javascript
// ❌ WRONG
`Price: $${property.price.toLocaleString()}`
// Output: "Price: $1,500,000"

// ✅ CORRECT
`Rent: $${property.monthlyRent.toLocaleString()}/month ($${property.annualRate}/sq ft/year)`
// Output: "Rent: $21,875/month ($35/sq ft/year)"
```

### Contact Type:
```javascript
// ❌ WRONG
const contactType = "Sales Agent"

// ✅ CORRECT
const contactType = "Leasing Agent" || "Leasing Representative" || "Tenant Representative"
```

---

## When in Doubt, Remember:

**Government agencies LEASE, they don't BUY.**

- They need monthly/annual rent costs
- They need lease terms (5-10 years typically)
- They need leasing agents to submit proposals to
- They need to know what's included in the rent
- They need to schedule tours and request lease agreements

**NEVER show them properties for sale!**

---

**Last Updated:** 2025-10-23

**Print this and put it on your monitor!** 📌
