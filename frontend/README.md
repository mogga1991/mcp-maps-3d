# Frontend - MCP Maps 3D

The frontend application built with Vite, Lit Web Components, and Google Maps 3D API.

## Project Structure

```
frontend/
├── src/
│   ├── index.tsx           # Entry point - bootstraps the app
│   ├── map_app.ts          # Main Lit component (UI, chat, map)
│   ├── mcp_maps_server.ts  # MCP server tools definition
│   └── rlp_content.ts      # RLP processing logic
├── index.html              # HTML template
├── index.css               # Global styles
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Key Components

### index.tsx
Bootstraps the application:
- Creates MCP client with in-memory transport
- Defines MCP tools (display_property_results, directions_on_google_maps)
- Links MCP server to Gemini AI
- Renders the `<gdm-map-app>` Lit component

### map_app.ts
Main UI component that manages:
- Sidebar with chat interface
- Google Maps 3D visualization
- Property markers and info windows
- Directions (route polylines, camera flyover)
- Chat state and saved properties
- Streaming responses from Gemini

### mcp_maps_server.ts
Defines MCP tools:
- `display_property_results`: Shows property markers with rich cards
- `directions_on_google_maps`: Draws route polyline and flies camera

## Running the Frontend

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

The frontend requires API keys in `../.env.local`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

See [../docs/API_KEYS_GUIDE.md](../docs/API_KEYS_GUIDE.md) for setup instructions.

## Backend Integration

The frontend connects to the backend API at `http://localhost:3003` for:
- RLP PDF upload and processing
- Property search via Apify scrapers
- Database operations

## Features

### Streaming Chat
- Streams thoughts and output from Gemini
- Surfaces grounding "Sources" in the UI
- Suppresses raw function call noise

### Property Display
- Interactive markers on 3D map
- Rich info windows with property details
- Saved properties panel

### Directions
- Route polyline visualization
- Camera flyover animation
- Turn-by-turn navigation preview

## Technology

- **Vite**: Build tool and dev server
- **Lit**: Web components framework
- **TypeScript**: Type safety
- **Google Maps 3D API**: Map visualization
- **Gemini AI**: Natural language processing
- **MCP SDK**: Model Context Protocol integration
