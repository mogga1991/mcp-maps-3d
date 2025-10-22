/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This file defines and runs an MCP (Model Context Protocol) server.
 * The server exposes tools that an AI model (like Gemini) can call to interact
 * with Google Maps functionality. These tools include:
 * - `display_property_results`: To display a list of property findings.
 * - `directions_on_google_maps`: To get and display directions.
 *
 * When the AI decides to use one of these tools, the MCP server receives the
 * call and then uses the `mapQueryHandler` callback to send the relevant
 * parameters (properties, origin/destination) to the frontend
 * (MapApp component in map_app.ts) to update the map display.
 */

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {Transport} from '@modelcontextprotocol/sdk/shared/transport.js';
import {z} from 'zod';

// Schema for a single property result
const propertySchema = z.object({
  name: z.string().describe('The name or address of the property.'),
  price: z.string().optional().describe('The price of the property (e.g., $25/sq ft/year).'),
  size: z.string().optional().describe('The size of the property (e.g., 7,500 sq ft).'),
  summary: z
    .string()
    .optional()
    .describe('A brief summary of the property.'),
  latitude: z.number().describe('The latitude of the property location.'),
  longitude: z.number().describe('The longitude of the property location.'),
  // Contact information
  broker: z.string().optional().describe('Name of the broker or leasing agent.'),
  propertyManager: z.string().optional().describe('Name of the property management company.'),
  contactEmail: z.string().optional().describe('Contact email address.'),
  contactPhone: z.string().optional().describe('Contact phone number.'),
  website: z.string().optional().describe('Property or listing website URL.'),
  // Additional details
  availableDate: z.string().optional().describe('When the property becomes available.'),
  propertyType: z.string().optional().describe('Type of property (e.g., Office, Warehouse, Mixed Use).'),
});

export type Property = z.infer<typeof propertySchema>;

export interface MapParams {
  properties?: Property[];
  origin?: string;
  destination?: string;
  // The old `location` param is now deprecated in favor of `properties`.
  location?: string;
}

export async function startMcpGoogleMapServer(
  transport: Transport,
  /**
   * Callback function provided by the frontend (index.tsx) to handle map updates.
   * This function is invoked when an AI tool call requires a map interaction,
   * passing the necessary parameters to update the map view (e.g., show location,
   * display directions). It is the bridge between MCP server tool execution and
   * the visual map representation in the MapApp component.
   */
  mapQueryHandler: (params: MapParams) => void,
) {
  // Create an MCP server
  const server = new McpServer({
    name: 'AI Studio Google Map',
    version: '1.0.0',
  });

  server.tool(
    'display_property_results',
    'Displays a list of property results on the interactive map. Use this to show the user properties that match their search criteria.',
    {
      properties: z
        .array(propertySchema)
        .describe(
          'An array of property objects to be displayed on the map.',
        ),
    },
    async ({properties}) => {
      mapQueryHandler({properties});
      return {
        content: [
          {
            type: 'text',
            text: `Displaying ${properties.length} properties on the map.`,
          },
        ],
      };
    },
  );

  server.tool(
    'directions_on_google_maps',
    'Search google maps for directions from origin to destination.',
    {origin: z.string(), destination: z.string()},
    async ({origin, destination}) => {
      mapQueryHandler({origin, destination});
      return {
        content: [
          {type: 'text', text: `Navigating from ${origin} to ${destination}`},
        ],
      };
    },
  );

  await server.connect(transport);
  console.log('server running');
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
