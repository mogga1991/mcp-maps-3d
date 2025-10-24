# Security Best Practices

Comprehensive security guidelines for protecting API keys, credentials, and sensitive data in the MCP Maps 3D project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [API Key Security](#api-key-security)
- [Git Security](#git-security)
- [MCP Server Security](#mcp-server-security)
- [Environment Separation](#environment-separation)
- [Access Control](#access-control)
- [Monitoring & Auditing](#monitoring--auditing)
- [Incident Response](#incident-response)
- [Compliance & Privacy](#compliance--privacy)

---

## Overview

This project handles sensitive data and requires multiple API keys and credentials. Following these security practices is **essential** to protect your services, data, and users.

### Security Principles

1. **Defense in Depth:** Multiple layers of security
2. **Least Privilege:** Minimal necessary permissions
3. **Separation of Concerns:** Dev vs Prod environments
4. **Audit Trail:** Track and monitor access
5. **Fail Secure:** Secure by default

---

## API Key Security

### ✅ DO: Secure Storage

**Environment Variables Only**
```bash
# ✅ GOOD - In .env.local
GEMINI_API_KEY=AIzaSyCIjGXkbOpwdNSyzbnzC-C06VmEbY7H39k

# ❌ BAD - Hardcoded in source
const apiKey = "AIzaSyCIjGXkbOpwdNSyzbnzC-C06VmEbY7H39k";
```

**Protected Files**
- `.env.local` (frontend)
- `backend/.env` (backend)
- `.mcp.local.json` (MCP servers)

All should be in `.gitignore`!

---

### ✅ DO: Key Rotation

**Rotation Schedule:**
- **Production keys:** Every 90 days (3 months)
- **Development keys:** Every 180 days (6 months)
- **Compromised keys:** Immediately

**How to Rotate:**

1. **Generate new key** from service dashboard
2. **Update environment files** with new key
3. **Test thoroughly** before revoking old key
4. **Revoke old key** after confirming new one works
5. **Document the rotation** (date, who, why)

---

### ✅ DO: API Restrictions

#### Google Maps API Key

**Application Restrictions:**
```
Development: HTTP referrers (localhost:*)
Production: HTTP referrers (yourdomain.com/*)
```

**API Restrictions:**
- Maps JavaScript API
- Geocoding API
- Directions API
- Places API (if used)

**Steps:**
1. Go to Google Cloud Console
2. Edit API key
3. Add "Application restrictions" → HTTP referrers
4. Add "API restrictions" → Select specific APIs
5. Save

---

#### Gemini API Key

**Usage Quotas:**
- Set daily/monthly quotas in AI Studio
- Enable billing alerts
- Monitor usage dashboard

**API Restrictions:**
- Enable only Gemini APIs you use
- Set per-project quotas
- Use separate keys for dev/prod

---

### ❌ DON'T: Common Mistakes

**Never do this:**
```javascript
// ❌ Exposed in client-side code
fetch('https://api.example.com', {
  headers: {
    'Authorization': 'Bearer sk_live_secret_key_here'
  }
});

// ❌ Committed to git
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6...";

// ❌ Shared in Slack/Email
"Hey team, the API key is: AIzaSyCIj..."

// ❌ Logged to console
console.log('API Key:', process.env.GEMINI_API_KEY);
```

**Always do this:**
```javascript
// ✅ Server-side only
const apiKey = process.env.GEMINI_API_KEY;

// ✅ Sanitized logs
console.log('API Key configured:', !!process.env.GEMINI_API_KEY);

// ✅ Secure sharing
"Check the .env.local file on the server for credentials"
```

---

## Git Security

### Critical Rules

1. **NEVER commit `.env` files** with real credentials
2. **ALWAYS commit `.env.example`** files (without real values)
3. **Check before every commit** for sensitive data

---

### Files to Gitignore

**Already in `.gitignore`:**
```gitignore
# Environment files
*.local
.env
.env.local
.env.*.local

# Secrets
*.key
*.pem
*.p12
secrets.json

# MCP configs with credentials
.mcp.local.json

# Logs (may contain sensitive data)
logs/
*.log

# Uploads
uploads/
*.pdf
```

---

### Pre-Commit Checklist

Before every `git commit`:

- [ ] Run `git diff` and review changes
- [ ] Search for "API" or "KEY" in staged files
- [ ] Check no `.env` files are staged
- [ ] Verify `.gitignore` is up to date
- [ ] No hardcoded credentials in code

**Quick check:**
```bash
# Check for potential secrets in staged files
git diff --cached | grep -i -E '(api|key|secret|password|token)'
```

---

### Leaked Credentials?

**If you accidentally commit API keys:**

1. **Revoke immediately** - Don't wait!
   - Gemini: https://aistudio.google.com/app/apikey
   - Google Maps: https://console.cloud.google.com/apis/credentials
   - Supabase: Project Settings → API → Reset keys
   - Neon: https://console.neon.tech/app/settings/api-keys

2. **Generate new keys** (follow rotation steps above)

3. **Remove from git history** (advanced):
   ```bash
   # WARNING: This rewrites history - coordinate with team!
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (dangerous!)
   git push origin --force --all
   ```

4. **Consider repository as compromised** - In extreme cases, create a new repo

---

## MCP Server Security

### Configuration Security

**Use `.mcp.local.json` (gitignored):**
```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "neon_api_secret_key_here"
      }
    }
  }
}
```

**Provide `.mcp.example.json` (committed):**
```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "your_neon_api_key_here"
      }
    }
  }
}
```

---

### Read-Only Mode (Recommended)

**Always start with read-only:**

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_READONLY": "true"
      }
    }
  }
}
```

**Benefits:**
- ✅ Prevents accidental data deletion
- ✅ Safe for production inspection
- ✅ Limits blast radius of mistakes
- ✅ Meets compliance requirements

---

### MCP Server Permissions

**Principle of Least Privilege:**

| Environment | MCP Access | Rationale |
|-------------|------------|-----------|
| **Development** | Read-only | Inspect data safely |
| **Staging** | Read-only | Verify before prod |
| **Production** | Read-only (if any) | Absolute minimum |

**For write operations:**
- Use backend API endpoints instead
- Require explicit user confirmation
- Log all modifications
- Implement rollback mechanisms

---

## Environment Separation

### Development vs Production

**Use separate credentials for each environment:**

| Service | Development | Production |
|---------|-------------|------------|
| **Gemini** | Dev API key | Prod API key |
| **Google Maps** | Unrestricted key | Restricted key |
| **Neon** | Dev project/branch | Prod project |
| **Supabase** | Dev project | Prod project |

---

### Neon Branching Strategy

**Use Neon branches for isolation:**

```
main (production)
├── develop (staging)
├── feature-rag-implementation (dev)
└── bugfix-upload-error (dev)
```

**Benefits:**
- Isolated testing environments
- Schema changes without risk
- Easy rollback
- Cost-effective (branches are cheap)

**Create a branch:**
```sql
-- Via Neon API or MCP server
"Create a new branch called 'feature-xyz' from main"
```

---

### Environment Variable Naming

**Use environment prefixes:**

```bash
# Development
DEV_GEMINI_API_KEY=...
DEV_DATABASE_URL=...

# Staging
STAGING_GEMINI_API_KEY=...
STAGING_DATABASE_URL=...

# Production
PROD_GEMINI_API_KEY=...
PROD_DATABASE_URL=...
```

**Or use separate files:**
```
.env.development
.env.staging
.env.production
```

---

## Access Control

### Team Member Access

**Role-Based Access:**

| Role | Gemini | Maps | Supabase | Neon | MCP |
|------|--------|------|----------|------|-----|
| **Developer** | Dev key | Dev key | Dev project | Dev branch | Read-only |
| **DevOps** | All keys | All keys | Admin | Admin | Read/Write |
| **Designer** | None | Dev key | None | None | None |
| **QA** | Dev key | Dev key | Read-only | Read-only | Read-only |

---

### Service Account Keys

**For CI/CD and automated systems:**

1. Create dedicated service accounts
2. Use minimal permissions
3. Rotate keys more frequently (monthly)
4. Monitor usage closely
5. Revoke immediately when not needed

**Example (GitHub Actions):**
```yaml
# .github/workflows/deploy.yml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  # Store in GitHub Secrets, not in code!
```

---

## Monitoring & Auditing

### API Usage Monitoring

**Check regularly:**

1. **Gemini AI Studio**
   - Daily API calls
   - Token usage
   - Error rates
   - Unusual patterns

2. **Google Cloud Console (Maps)**
   - API calls per day
   - Requests by country
   - Error percentages
   - Quota usage

3. **Supabase Dashboard**
   - Database queries
   - Storage usage
   - Auth attempts
   - Edge function calls

4. **Neon Console**
   - Connection count
   - Query performance
   - Storage growth
   - Branch activity

---

### Set Up Alerts

**Google Cloud (Maps API):**
```
1. Go to Monitoring → Alerting
2. Create Policy:
   - Metric: API calls
   - Condition: > 80% of quota
   - Notification: Email/Slack
```

**Supabase:**
```
1. Project Settings → Alerts
2. Enable:
   - Storage quota warnings
   - High database CPU
   - Auth failures
```

**Neon:**
```
1. Project Settings → Alerts
2. Enable:
   - Compute hours
   - Storage warnings
   - Connection limits
```

---

### Audit Logging

**What to log:**

✅ API key usage (without exposing keys)
✅ Database queries (sanitized)
✅ File uploads/downloads
✅ Authentication attempts
✅ Configuration changes
✅ Error events

**What NOT to log:**

❌ Full API keys or tokens
❌ Passwords or credentials
❌ Personal identifiable information (PII)
❌ Credit card numbers
❌ Social security numbers

**Example logging:**
```javascript
// ✅ GOOD
logger.info('Gemini API call', {
  endpoint: '/generate',
  tokens: 1234,
  model: 'gemini-2.5-flash',
  user_id: 'user_123',
  success: true
});

// ❌ BAD
logger.info('API call', {
  api_key: process.env.GEMINI_API_KEY, // NEVER log keys!
  user_email: 'user@example.com', // PII without consent
  credit_card: '4111-1111-1111-1111' // Huge security violation!
});
```

---

## Incident Response

### If Keys Are Compromised

**Immediate Actions (within 5 minutes):**

1. **Revoke the compromised key immediately**
2. **Generate a new key**
3. **Update all services** using the key
4. **Notify team members**

**Investigation (within 1 hour):**

1. **Review access logs** for suspicious activity
2. **Check for data exfiltration**
3. **Identify how it was compromised**
4. **Document the incident**

**Recovery (within 24 hours):**

1. **Rotate all related credentials**
2. **Patch the vulnerability**
3. **Implement additional controls**
4. **Post-mortem analysis**

---

### Incident Response Contacts

**Internal:**
- Security lead: [security@your-org.com]
- DevOps team: [devops@your-org.com]
- Management: [management@your-org.com]

**External:**
- Gemini Support: https://support.google.com
- Google Cloud Support: https://cloud.google.com/support
- Supabase Support: support@supabase.io
- Neon Support: support@neon.tech

---

### Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **Critical** | Production keys exposed | < 5 minutes | API key in public repo |
| **High** | Dev keys exposed | < 1 hour | Keys in Slack message |
| **Medium** | Config error | < 4 hours | Wrong permissions set |
| **Low** | Documentation issue | < 24 hours | Out-of-date security doc |

---

## Compliance & Privacy

### Data Protection

**RLP Documents contain sensitive information:**
- Government requirements
- Location data
- Budget information
- Contact details

**Requirements:**
- Encrypt in transit (HTTPS)
- Encrypt at rest (Supabase/Neon default)
- Access logging
- Data retention policies
- Right to deletion

---

### GDPR Considerations

If handling EU user data:

✅ **Obtain consent** for data processing
✅ **Provide privacy policy** explaining data usage
✅ **Enable data export** for user requests
✅ **Implement deletion** within 30 days of request
✅ **Notify of breaches** within 72 hours
✅ **Use EU data centers** (Neon/Supabase regions)

---

### Data Retention

**Recommended policies:**

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| RLP documents | 1 year | Business need |
| Logs | 90 days | Security audit |
| Session data | 24 hours | Privacy |
| Analytics | 1 year | Improvement |
| Backups | 30 days | Recovery |

**Implement cleanup:**
```sql
-- Delete old RLP documents
DELETE FROM rlp_documents
WHERE created_at < NOW() - INTERVAL '1 year';

-- Archive instead of delete (better approach)
INSERT INTO rlp_documents_archive
SELECT * FROM rlp_documents
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Security Checklist

### Initial Setup

- [ ] All `.env` files are in `.gitignore`
- [ ] API keys use environment variables only
- [ ] Google Maps API has restrictions enabled
- [ ] Separate dev/prod credentials configured
- [ ] MCP servers use read-only mode
- [ ] Team has access to this security guide

---

### Weekly

- [ ] Review API usage dashboards
- [ ] Check for unusual activity
- [ ] Verify no secrets in recent commits
- [ ] Update dependencies (`npm audit`)

---

### Monthly

- [ ] Review access logs
- [ ] Check quota usage
- [ ] Verify backup integrity
- [ ] Update security documentation

---

### Quarterly

- [ ] Rotate production API keys
- [ ] Review team member access
- [ ] Security training/review
- [ ] Penetration testing (if applicable)

---

### Annually

- [ ] Comprehensive security audit
- [ ] Update incident response plan
- [ ] Review compliance requirements
- [ ] Renew certifications (if applicable)

---

## Tools & Resources

### Security Scanning

**Git Secret Scanning:**
```bash
# Install git-secrets
brew install git-secrets

# Setup
git secrets --install
git secrets --register-aws

# Scan
git secrets --scan
```

**npm audit:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

**Dependency Updates:**
```bash
# Check outdated packages
npm outdated

# Interactive updates
npx npm-check-updates -i
```

---

### Password Managers

**For team API key sharing:**

- 1Password (Teams)
- Bitwarden (Open source)
- LastPass (Enterprise)
- AWS Secrets Manager (Cloud)
- HashiCorp Vault (Enterprise)

**Never share credentials via:**
- Email
- Slack/Teams messages
- Text messages
- Shared documents
- Sticky notes 😅

---

### Additional Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **API Security Best Practices:** https://owasp.org/API-Security/
- **Google Cloud Security:** https://cloud.google.com/security
- **Supabase Security:** https://supabase.com/docs/guides/platform/going-into-prod
- **Neon Security:** https://neon.tech/docs/security/security-overview

---

## Questions?

Security concerns? Contact:
- Project maintainer: [your-email@example.com]
- Security team: [security@your-org.com]
- Open an issue (for non-sensitive concerns)

---

**Remember:** Security is everyone's responsibility!

**Last Updated:** 2025-10-23
