# MCP Maps 3D

A full-stack real estate property search application with interactive 3D Google Maps, AI-powered chat using Gemini, and RLP (Request for Lease Proposals) document processing.

## Project Structure

```
mcp-maps-3d/
├── frontend/          # Vite + Lit + Google Maps 3D frontend
│   ├── src/          # Frontend source files
│   │   ├── index.tsx           # Main entry point
│   │   ├── map_app.ts          # Map UI component
│   │   ├── mcp_maps_server.ts  # MCP server tools
│   │   └── rlp_content.ts      # RLP processing
│   ├── index.html    # HTML template
│   ├── index.css     # Styles
│   └── package.json  # Frontend dependencies
├── backend/          # Express.js API server
│   └── src/          # Backend source files
│       ├── index.js       # Server entry point
│       ├── config/        # Database & service configs
│       ├── routes/        # API routes
│       └── services/      # Business logic
├── docs/             # Documentation
└── archive/          # Test files and old results
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- API Keys (see [docs/API_KEYS_GUIDE.md](docs/API_KEYS_GUIDE.md))

### Setup

1. **Clone and install dependencies:**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy example files
   cp .env.example .env.local
   cp backend/.env.example backend/.env

   # Edit .env.local and backend/.env with your API keys
   ```

3. **Start the application:**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: `http://localhost:3003`

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Features

- **3D Interactive Map**: Google Maps 3D visualization with property markers
- **AI-Powered Chat**: Gemini AI integration with streaming responses
- **MCP Tools**: Model Context Protocol for property search and directions
- **RLP Processing**: Upload and process Request for Lease Proposals (PDFs)
- **Property Search**: Search for commercial real estate properties
- **Directions**: Get directions between locations on the 3D map

## Documentation

- [API Keys Setup Guide](docs/API_KEYS_GUIDE.md)
- [MCP Server Setup](docs/MCP_SETUP_GUIDE.md)
- [Security Best Practices](docs/SECURITY.md)
- [Lease Search Requirements](docs/LEASE_SEARCH_REQUIREMENTS.md)

## Tech Stack

**Frontend:**
- Vite
- Lit (Web Components)
- Google Maps 3D API
- Google Gemini AI
- Model Context Protocol (MCP)

**Backend:**
- Express.js
- Google Gemini AI (for PDF processing)
- Supabase (optional - file storage)
- Neon Database (optional - metadata storage)

## Development

**Frontend development:**
```bash
cd frontend
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build
```

**Backend development:**
```bash
cd backend
npm run dev        # Start with auto-reload
npm start          # Start production server
```

## License

MIT
