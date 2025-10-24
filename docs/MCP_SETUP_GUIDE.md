# MCP Server Setup Guide

Complete guide to setting up Model Context Protocol (MCP) servers for direct database and cloud service access in Claude Code.

---

## 📋 Table of Contents

- [What is MCP?](#what-is-mcp)
- [Why Use MCP Servers?](#why-use-mcp-servers)
- [Available MCP Servers](#available-mcp-servers)
- [Configuration Methods](#configuration-methods)
- [Setup Instructions](#setup-instructions)
- [Testing MCP Servers](#testing-mcp-servers)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that enables AI assistants like Claude to connect directly to external systems, databases, and cloud services.

### Key Benefits

- **Direct Access:** Claude can query databases, read logs, and inspect services without you running commands
- **Real-Time Data:** Get live data from your Neon database and Supabase storage
- **Natural Language:** Use plain English to interact with technical services
- **Debugging Power:** View logs, check schemas, and troubleshoot issues instantly
- **Team Collaboration:** Share MCP configs via git for consistent team setup

---

## Why Use MCP Servers?

### Without MCP (Current State)
```
You: "Check if any RLP documents were uploaded today"
Claude: "Could you run this SQL query for me?"
You: *copies query, runs it manually, pastes results*
Claude: "Thanks! I see 3 documents were uploaded..."
```

### With MCP (Super Powered!)
```
You: "Check if any RLP documents were uploaded today"
Claude: *automatically queries Neon database*
Claude: "Yes! I found 3 RLP documents uploaded today:
        - Chicago Office Space RLP (2.3 MB)
        - NYC Warehouse Requirements (1.8 MB)
        - Boston Retail Location (945 KB)"
```

### What This Enables

✅ **Database Queries:** "Show me all RLP documents from last week"
✅ **Storage Inspection:** "What files are in the rlp-documents bucket?"
✅ **Schema Analysis:** "What's the structure of the rlp_documents table?"
✅ **Log Monitoring:** "Are there any errors in today's Supabase logs?"
✅ **Migrations:** "Create a new branch in Neon for testing this feature"
✅ **Performance:** "Show me database query performance stats"
✅ **Debugging:** "Why did this RLP upload fail? Check the logs"

---

## Available MCP Servers

### 1. **Neon MCP Server** (Recommended)

**Package:** `@neondatabase/mcp-server-neon`
**Source:** https://github.com/neondatabase/mcp-server-neon

**Features:**
- ✅ Create/manage Neon projects and branches
- ✅ Execute SQL queries
- ✅ View database schemas
- ✅ Manage migrations
- ✅ Monitor performance
- ✅ Access database logs

**Authentication:** Neon API Key

---

### 2. **Supabase MCP Server** (Recommended)

**Package:** `@supabase-community/supabase-mcp`
**Source:** https://github.com/supabase-community/supabase-mcp

**Features:**
- ✅ Manage storage buckets
- ✅ List/view uploaded files
- ✅ Query database via Supabase
- ✅ Access logs and monitoring
- ✅ Manage authentication policies
- ✅ Execute Edge Functions

**Authentication:** Supabase URL + Anon/Service Key

**Security Note:** Use **read-only mode** for production!

---

### 3. **PostgreSQL MCP Server** (Alternative)

**Package:** `@modelcontextprotocol/server-postgres`
**Source:** https://github.com/modelcontextprotocol/servers

**Features:**
- ✅ Direct PostgreSQL connection (works with Neon too)
- ✅ Read-only by default
- ✅ Schema inspection
- ✅ Query execution

**Authentication:** PostgreSQL connection string

**Use Case:** Good if you only need database access (not Neon-specific features)

---

## Configuration Methods

There are **three ways** to configure MCP servers in Claude Code:

### Method 1: CLI Wizard (Easiest)

```bash
claude mcp add neon --scope project
```

Interactive prompts guide you through setup.

### Method 2: Direct Config File (Recommended for Teams)

Create `.mcp.json` in your project root (can be committed to git).

### Method 3: Global Config (Personal Use)

Edit `~/.claude.json` for user-wide MCP servers.

**We recommend Method 2** for this project (team collaboration).

---

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Claude Code installed
- API keys ready (see [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md))

---

### Step 1: Get Your API Keys

#### Neon API Key

1. Go to https://console.neon.tech/app/settings/api-keys
2. Click "Generate new API key"
3. Give it a name (e.g., "MCP Server")
4. Copy the key (starts with `neon_api_`)
5. **Save it securely** (you won't see it again!)

#### Supabase Credentials

You already have these in `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (for read-only) or `SUPABASE_SERVICE_KEY` (for admin)

**For MCP, use `SUPABASE_ANON_KEY`** (safer, read-only by default).

---

### Step 2: Create MCP Configuration

Create **`.mcp.json`** in the project root:

```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "neon_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    },
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase-community/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://xfrauodnzmqplatxpiyi.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    },
    "postgres-direct": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
      ]
    }
  }
}
```

**Important:** Replace placeholder values with your actual credentials.

---

### Step 3: Add to .gitignore (Security!)

The `.mcp.json` file contains **sensitive credentials**, so we need to protect it:

**Option A: Use `.mcp.local.json` (Recommended)**

```bash
# Rename to make it gitignored automatically
mv .mcp.json .mcp.local.json
```

Then create a template `.mcp.example.json` for your team:

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
    },
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase-community/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "your_supabase_url_here",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key_here"
      }
    }
  }
}
```

**Option B: Use Environment Variables**

Reference environment variables in `.mcp.json`:

```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "${NEON_API_KEY}"
      }
    }
  }
}
```

Then set `NEON_API_KEY` in your shell (`.bashrc`, `.zshrc`, etc.).

**We'll implement Option A** (safer for teams).

---

### Step 4: Configure Claude Code

Claude Code automatically discovers `.mcp.json` or `.mcp.local.json` in your project root.

**Restart Claude Code** to load the new configuration.

---

### Step 5: Verify Installation

In Claude Code, run:

```
/mcp list
```

**Expected Output:**
```
Connected MCP Servers:
✅ neon-postgres - @neondatabase/mcp-server-neon
✅ supabase - @supabase-community/supabase-mcp
✅ postgres-direct - @modelcontextprotocol/server-postgres
```

Or use the CLI:

```bash
claude mcp list
```

---

## Testing MCP Servers

### Test 1: Neon Database Connection

**Prompt for Claude:**
```
Can you list all tables in my Neon database?
```

**Expected Response:**
```
I can see your Neon database has the following tables:
- rlp_documents (9 columns)
- text_chunks (6 columns)
```

---

### Test 2: Query RLP Documents

**Prompt:**
```
Show me all RLP documents that have been uploaded.
Include filename, size, and status.
```

**Expected Response:**
```
Here are the RLP documents in your database:

1. Chicago_Office_Space.pdf (2,345,678 bytes) - Status: processed
2. NYC_Warehouse_Requirements.pdf (1,876,543 bytes) - Status: processed
3. Boston_Retail_Location.pdf (945,123 bytes) - Status: pending

Total: 3 documents
```

---

### Test 3: Supabase Storage

**Prompt:**
```
What files are currently stored in the rlp-documents bucket?
```

**Expected Response:**
```
The rlp-documents bucket contains:

1. 1729680123456-Chicago_Office_Space.pdf (2.3 MB)
2. 1729680234567-NYC_Warehouse_Requirements.pdf (1.8 MB)
3. 1729680345678-Boston_Retail_Location.pdf (945 KB)

Total storage used: 5.05 MB
```

---

### Test 4: Database Schema

**Prompt:**
```
Show me the schema for the rlp_documents table
```

**Expected Response:**
```
Schema for rlp_documents:

Columns:
- id: SERIAL PRIMARY KEY
- filename: TEXT NOT NULL
- original_filename: TEXT NOT NULL
- file_size: BIGINT
- storage_url: TEXT
- extracted_text: TEXT
- requirements: JSONB
- status: TEXT DEFAULT 'pending'
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

---

### Test 5: Advanced Query

**Prompt:**
```
Can you show me a summary of RLP documents by status?
How many are processed vs pending?
```

**Expected Response:**
```
RLP Document Summary by Status:

✅ Processed: 2 documents (66.7%)
⏳ Pending: 1 document (33.3%)

Total: 3 documents
```

---

## Usage Examples

### Development Workflow

#### Before Writing Code
```
You: "What's the current schema for the rlp_documents table?"
Claude: *queries database and shows schema*
You: "I need to add a 'priority' column"
Claude: *generates migration SQL*
```

#### During Testing
```
You: "Did the test RLP upload succeed?"
Claude: *checks database* "Yes, I see the document in the database with status 'processed'"
You: "Show me the extracted requirements"
Claude: *queries and displays the JSONB data*
```

#### Debugging
```
You: "The RLP processor seems to be failing. Check the logs"
Claude: *checks Supabase logs* "I see 3 errors in the last hour..."
You: "What's the error message?"
Claude: "All three show 'GEMINI_API_KEY is not set'..."
```

---

### Database Management

#### Create a Development Branch
```
You: "Create a new Neon branch called 'feature-rag-implementation'
     based on the main branch"
Claude: *uses Neon API to create branch*
Claude: "✅ Created branch 'feature-rag-implementation'
        Connection string: postgresql://..."
```

#### Run Analytics Query
```
You: "What's the average file size of RLP documents uploaded
     in the last 7 days?"
Claude: *runs SQL query*
Claude: "Average file size: 1.7 MB
        Total documents: 12
        Date range: Oct 16 - Oct 23"
```

---

### Storage Management

#### Check Storage Usage
```
You: "How much storage am I using in Supabase?"
Claude: *checks bucket stats*
Claude: "Current usage: 45.2 MB / 500 MB (9% of free tier)"
```

#### Find Large Files
```
You: "List all files larger than 5MB"
Claude: *queries storage*
Claude: "Found 2 files over 5MB:
        1. Government_Complex_RLP.pdf (7.8 MB)
        2. Warehouse_District_Requirements.pdf (6.2 MB)"
```

---

## Troubleshooting

### MCP Server Not Showing Up

**Problem:** `claude mcp list` doesn't show your server

**Solutions:**
1. Check file is named `.mcp.json` or `.mcp.local.json` (with the dot!)
2. Verify JSON syntax is valid (use a JSON validator)
3. Restart Claude Code completely
4. Check Claude Code logs:
   ```bash
   tail -f ~/Library/Logs/Claude/main.log
   ```

---

### "Authentication failed" or "Invalid credentials"

**Problem:** MCP server can't connect

**Solutions:**
1. **Neon:** Verify `NEON_API_KEY` is correct (starts with `neon_api_`)
2. **Supabase:** Check both `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Try regenerating API keys
4. Check for extra spaces/newlines in keys
5. Verify keys are in quotes in JSON

---

### "Command not found: npx"

**Problem:** Node.js not installed or not in PATH

**Solutions:**
1. Install Node.js 18+ from https://nodejs.org
2. Verify installation: `node --version` and `npx --version`
3. Restart terminal/Claude Code after installing

---

### Queries Return Empty Results

**Problem:** Database is empty or credentials are wrong

**Solutions:**
1. Verify database actually has data:
   ```bash
   # Check backend logs when uploading RLP
   cd backend
   npm run dev
   # Then upload a test document
   ```
2. Confirm `DATABASE_URL` in `backend/.env` matches Neon connection
3. Check if tables exist: Ask Claude "List all tables in the database"

---

### MCP Server Timeout

**Problem:** Queries take too long or hang

**Solutions:**
1. Check internet connection
2. Verify Neon/Supabase services are up
3. Try simpler query first: "SELECT 1"
4. Increase timeout in `.mcp.json`:
   ```json
   {
     "timeout": 30000,
     "command": "npx",
     ...
   }
   ```

---

### Permission Denied Errors

**Problem:** Can't write to database or modify storage

**Solutions:**
1. **This is expected!** MCP servers use **read-only mode** by default (for safety)
2. For Supabase: Check Row Level Security policies
3. For write operations, use the backend API (safer)
4. If you really need write access (dev only):
   ```json
   {
     "env": {
       "POSTGRES_READONLY": "false"
     }
   }
   ```
   ⚠️ **NOT recommended for production!**

---

## Security Considerations

### ✅ Best Practices

1. **Use Read-Only Mode**
   - Default for most MCP servers
   - Prevents accidental data modification
   - Safe for production inspection

2. **Separate Development Keys**
   - Never use production keys in MCP
   - Create dedicated "development" projects
   - Use Neon branch feature for isolated testing

3. **Gitignore MCP Config**
   - Use `.mcp.local.json` (auto-gitignored)
   - Or add `.mcp.json` to `.gitignore`
   - Provide `.mcp.example.json` template

4. **API Key Scoping**
   - Neon: Use project-specific keys when possible
   - Supabase: Use `anon` key (not `service_role` key)
   - PostgreSQL: Create read-only database user

5. **Monitor Usage**
   - Check MCP server logs regularly
   - Monitor API quotas
   - Set up alerts for unusual activity

---

### ⚠️ Things to Avoid

❌ **Don't commit real credentials to git**
❌ **Don't use production keys for MCP**
❌ **Don't enable write mode unless necessary**
❌ **Don't share MCP configs with credentials**
❌ **Don't skip authentication/authorization**

---

### 🔒 If Keys Are Compromised

1. **Immediately revoke** the compromised key
2. Generate a new key from the service dashboard
3. Update `.mcp.local.json` with new key
4. Restart Claude Code
5. Review access logs for suspicious activity
6. Rotate all related credentials

**Service-Specific Actions:**
- **Neon:** [API Keys Settings](https://console.neon.tech/app/settings/api-keys) → Delete old key
- **Supabase:** Project Settings → API → Reset keys
- **General:** Enable 2FA on all accounts

---

## Advanced Configuration

### Using Environment Variables

Store sensitive data in environment variables:

**1. Create `.env.mcp` (gitignored):**
```bash
NEON_API_KEY=neon_api_xxxxxxxxxxxxxxxx
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Update `.mcp.json` to reference them:**
```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "${NEON_API_KEY}"
      }
    }
  }
}
```

**3. Load variables before starting Claude Code:**
```bash
export $(cat .env.mcp | xargs)
claude
```

---

### Custom Timeouts

For long-running queries:

```json
{
  "mcpServers": {
    "neon-postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "timeout": 60000,
      "env": {
        "NEON_API_KEY": "..."
      }
    }
  }
}
```

---

### Multiple Neon Projects

Configure multiple Neon projects:

```json
{
  "mcpServers": {
    "neon-prod": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "neon_api_production_key",
        "NEON_PROJECT_ID": "prod-project-id"
      }
    },
    "neon-dev": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "neon_api_dev_key",
        "NEON_PROJECT_ID": "dev-project-id"
      }
    }
  }
}
```

---

## Quick Reference

### MCP Commands in Claude Code

| Command | Purpose |
|---------|---------|
| `/mcp list` | Show connected MCP servers |
| `/mcp status` | Check server health |
| `/mcp reload` | Reload MCP configuration |
| `/mcp logs` | View MCP server logs |

### Useful Prompts

| Task | Prompt |
|------|--------|
| List tables | "What tables are in the database?" |
| View schema | "Show me the schema for [table_name]" |
| Count records | "How many records are in [table_name]?" |
| Recent data | "Show me the last 5 RLP documents uploaded" |
| Storage stats | "How much storage am I using?" |
| Check logs | "Are there any errors in the logs today?" |

---

## Resources

### Official Documentation

- **Neon MCP Server:** https://neon.tech/docs/ai/neon-mcp-server
- **Supabase MCP:** https://supabase.com/docs/guides/getting-started/mcp
- **MCP Protocol:** https://modelcontextprotocol.io
- **Claude Code MCP:** https://docs.claude.com/en/docs/claude-code/mcp

### GitHub Repositories

- Neon: https://github.com/neondatabase/mcp-server-neon
- Supabase: https://github.com/supabase-community/supabase-mcp
- PostgreSQL: https://github.com/modelcontextprotocol/servers
- MCP Spec: https://github.com/anthropics/mcp

---

## Next Steps

1. ✅ Complete API key setup ([API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md))
2. ✅ Configure MCP servers (this guide)
3. ✅ Test connections
4. 📚 Review security practices ([SECURITY.md](./SECURITY.md))
5. 🚀 Start using Claude Code with superpowers!

---

**Last Updated:** 2025-10-23

**Questions?** Check the [Troubleshooting](#troubleshooting) section or open an issue on GitHub.
