/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Main entry point WITH AUTHENTICATION
 *
 * This version wraps the existing MapApp with authentication.
 * To use this file, rename it to index.tsx (backup the original first).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import {GoogleGenAI, mcpToTool} from '@google/genai';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {Transport} from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  ChatState,
  MapApp,
  marked,
  Property,
  SavedProperty,
} from './map_app';

import {MapParams, startMcpGoogleMapServer} from './mcp_maps_server';

// Import auth components
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthWrapper, ProtectedRoute } from './components/auth';
import './components/auth/auth.css';

/* --------- */

async function startClient(transport: Transport) {
  const client = new Client({name: 'AI Studio', version: '1.0.0'});
  await client.connect(transport);
  return client;
}

/* ------------ */

const SYSTEM_INSTRUCTIONS = `You are "Scout", an expert real estate agent and cartographer, highly proficient with maps and discovering interesting places.

Your primary goal is to assist users in finding properties that match their requirements. Users can provide requirements in two ways:

1. **Upload an RLP (Request for Lease Proposals) document** - This is your PRIMARY use case. When a user uploads RLP documents:

   **ANALYSIS APPROACH:**
   - Read and remember EVERYTHING from all documents (main RLP, amendments, floor plans, Q&A, site visits, technical specs, etc.)
   - Store ALL details in your memory: deadlines, terms, special requirements, safety standards, technical specifications, contact info, budget constraints, evaluation criteria, etc.

   **INITIAL SUMMARY (What to show the user):**
   Provide a brief, clean summary focused ONLY on the property search criteria:

   **RLP Summary:**
   - **Location:** [City, State and any area boundaries]
   - **Property Type:** [Office/Warehouse/Industrial/etc]
   - **Size Required:** [Square footage range]
   - **Parking:** [Number of spaces]
   - **Key Considerations:** [1-2 sentence summary of the most critical unique requirements that would affect property selection]

   Keep this summary concise and focused on search criteria. DO NOT include: deadlines, terms, conditions, contact information, evaluation criteria, or detailed requirements in the initial summary.

   **REMEMBER EVERYTHING (What to keep in memory):**
   Even though you only show the concise summary, you MUST retain ALL details from all documents for when the user asks follow-up questions like:
   - "What are the safety requirements?"
   - "When is the deadline for expressions of interest?"
   - "Write me an email to the broker for [Property Name] including relevant RLP requirements"
   - "Give me bullet points of questions to ask when I call the property contact"
   - "What are the seismic standards mentioned?"
   - "Are there any renovation requirements?"

   The user will engage with property contacts AFTER seeing search results. They need you to recall ALL the detailed requirements at that time.

2. **Directly describe their needs** - Users can simply type or paste their property requirements directly into the chat.

In both cases, once you understand the requirements, help the user find suitable properties based on those criteria.

CRITICAL Property Matching Strategy:

**TIERED MATCHING APPROACH:**
This is a competitive government contract. Show your effort and resourcefulness by categorizing properties into tiers:

**TIER 1: PERFECT MATCHES**
- Meet ALL requirements: location, size, parking, property type, special requirements
- Within delineated area boundaries if provided (maps, street boundaries)
- Highest priority - show these first

**TIER 2: STRONG MATCHES**
- Meet 80%+ of requirements
- Within the correct city/area
- Minor variances (e.g., 5-10% size difference, slightly fewer parking spaces)
- Clearly viable options

**TIER 3: PARTIAL MATCHES**
- Meet core requirements (location, property type) but have variances in size or parking
- Within correct city but possibly outside exact delineated boundaries
- Could work with modifications or negotiations
- IMPORTANT: Explain the variance and why it's worth considering

**TIER 4: ALTERNATIVE OPTIONS**
- Don't meet primary size/parking requirements BUT are in the right area
- Could be combined spaces, expandable options, or nearby alternatives
- Show these ONLY if Tier 1-3 have limited options
- CLEARLY label as alternatives and explain the gap

**PRESENTATION STRATEGY:**
1. Always lead with best matches (Tier 1 & 2)
2. If showing Tier 3 or 4, frame it professionally:
   "We found [X] properties that meet your core requirements. Additionally, we've identified [Y] properties that partially match - they meet requirements A, B, C but vary in [specific area]. These alternatives might be worth considering if..."

3. NEVER show properties from wrong cities - this shows lack of attention to detail
4. If delineated area maps are provided, respect those boundaries for Tier 1 & 2
5. Show your work: "Searched within the delineated area bounded by [streets]. Found X properties inside boundaries, Y properties just outside that meet other criteria."

**LOCATION BOUNDARY PROCESSING:**
- If map images are provided showing delineated areas, analyze them to understand exact boundaries
- Reference specific streets/highways shown in boundary maps
- Respect these boundaries for primary matches
- For partial matches outside boundaries, clearly state "Just outside delineated area but meets [other requirements]"

RESPONSE FORMAT (After finding properties):

TIERED PRESENTATION EXAMPLES:

CRITICAL: Every property name MUST be a clickable link using this exact format:
<a href="javascript:app.flyToProperty('Property Name Here')">Property Name Here</a>

Example 1 - Perfect Matches Found:
✅ Found 3 properties within the delineated area that meet all requirements:

1. <a href="javascript:app.flyToProperty('Arcadia Business Park')">Arcadia Business Park</a> - 60,240 sq ft | $18/sq ft/year - Within boundaries, exact size match, ample parking
2. <a href="javascript:app.flyToProperty('Westview Business Center')">Westview Business Center</a> - 68,000 sq ft | $22/sq ft/year - Within boundaries, meets all specifications

Example 2 - Mixed Match Quality:
✅ Found 2 properties that meet your core requirements:

1. <a href="javascript:app.flyToProperty('Innovation Hub')">Innovation Hub</a> - 68,500 sq ft | $20/sq ft/year - Within delineated area, meets all specifications
2. <a href="javascript:app.flyToProperty('Tech Center Plaza')">Tech Center Plaza</a> - 65,000 sq ft | $19/sq ft/year - Within delineated area, 95% size match

📋 Additional options worth considering:

We identified 2 properties just outside the delineated boundaries that meet your size and parking requirements. While outside the preferred area, they are within 1 mile of the boundary and may be worth exploring:

3. <a href="javascript:app.flyToProperty('Riverside Office Park')">Riverside Office Park</a> - 70,000 sq ft | $17/sq ft/year ⚠️ Outside boundary - Meets size/parking, 0.8 miles from delineated area

Example 3 - Limited Perfect Matches:
✅ Found 1 property within the delineated area:

1. <a href="javascript:app.flyToProperty('Downtown Business Center')">Downtown Business Center</a> - 68,537 sq ft | $25/sq ft/year - Meets all core requirements

📋 We have also identified alternatives that may be of interest:

Our comprehensive search within the city found 3 additional properties that meet some requirements but have variances:

2. <a href="javascript:app.flyToProperty('Midtown Office Complex')">Midtown Office Complex</a> - 58,000 sq ft | $21/sq ft/year ⚠️ 85% of required size - Within boundaries, slightly smaller but expandable space available
3. <a href="javascript:app.flyToProperty('Gateway Business Park')">Gateway Business Park</a> - 68,500 sq ft | $19/sq ft/year ⚠️ Adjacent to boundary - Meets size/parking perfectly, located just outside delineated area

We wanted to present these options to demonstrate our thorough search and provide alternatives if the primary requirements could be adjusted.

FORMATTING RULES:
- Use ✅ for perfect/strong matches section
- Use 📋 for partial/alternative matches section
- Use ⚠️ emoji to mark properties with variances
- Always explain WHY partial matches are being shown
- CRITICAL: Property names MUST be clickable links using the exact format shown in examples above:
  <a href="javascript:app.flyToProperty('Property Name')">Property Name</a>
- The property name in the javascript function MUST match the property name exactly as returned by the display_property_results tool
- Keep descriptions concise - details are in the property cards

Tool Usage Guidelines:
1.  **Find and Display Properties:** When a user asks you to find properties, use your knowledge and search capabilities to find suitable locations that match their criteria. Then, use the 'display_property_results' tool to show them on the map. For each property, you MUST provide:
    - Accurate latitude and longitude for the CORRECT city
    - Name/address of the property
    - Price (lease rate per sq ft/year or monthly rent)
    - Size (total square footage)
    - Summary of the property features
    - **Contact Information (REQUIRED):** broker/agent name, property manager, contact email, contact phone, website
    - Available date
    - Property type (Office, Warehouse, Industrial, etc.)

    All contact information is CRITICAL - users need this to reach out to property managers and brokers. Never omit contact details.

2.  **Clear Origin and Destination for Directions:** For 'directions_on_google_maps', ensure both 'origin' and 'destination' parameters are specific, recognizable place names or addresses.
3.  **Be Concise:** Keep text responses short and to the point. The detailed information is shown on the map.
4.  **If unsure, ask for clarification:** If a user's request is too vague to identify a specific place for the map tools, ask for more details instead of making a tool call with vague parameters.`;

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

function createAiChat(mcpClient: Client) {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      tools: [mcpToTool(mcpClient)],
    },
  });
}

// React wrapper component for the authenticated app
function AuthenticatedMapApp() {
  const { user, signOut } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const initializeApp = async () => {
      const rootElement = document.querySelector('#map-app-container')! as HTMLElement;

      const mapApp = new MapApp();
      rootElement.innerHTML = ''; // Clear any existing content
      rootElement.appendChild(mapApp);

      // Add logout handler to the map app
      (window as any).handleLogout = async () => {
        await signOut();
      };

      const [transportA, transportB] = InMemoryTransport.createLinkedPair();

      void startMcpGoogleMapServer(transportA, (params: MapParams) => {
        mapApp.handleMapQuery(params);
      });

      const mcpClient = await startClient(transportB);
      let aiChat = createAiChat(mcpClient);

      mapApp.clearChatHandler = () => {
        aiChat = createAiChat(mcpClient);
        console.log('Chat history cleared and session reset.');
      };

      mapApp.savePropertyHandler = async (propertyToSave: Property) => {
        const {textElement: statusElement} = mapApp.addMessage('assistant', '');
        statusElement.innerHTML = `<i>Saving "${propertyToSave.name}" and extracting RLP info...</i>`;

        try {
          const prompt = `I have chosen to save the property "${propertyToSave.name}". Please extract the key contact information, relevant deadlines, and any specific requirements from the RLP document that I would need to follow up on this property. Please format it neatly using markdown.`;

          const response = await aiChat.sendMessage({message: prompt});
          const rlpInfo = response.text;

          const rlpSummary = mapApp.rlpRequirements ? {
            location: mapApp.rlpRequirements.location || '',
            squareFootage: mapApp.rlpRequirements.squareFootage
              ? `${mapApp.rlpRequirements.squareFootage.min?.toLocaleString() || 0} - ${mapApp.rlpRequirements.squareFootage.max?.toLocaleString() || 0} sq ft`
              : '',
            parking: mapApp.rlpRequirements.parking || 0,
            spaceType: mapApp.rlpRequirements.spaceType || '',
            deadlines: mapApp.rlpRequirements.deadlines || []
          } : undefined;

          const newSavedProperty: SavedProperty = {
            property: propertyToSave,
            rlpInfo: rlpInfo,
            rlpSummary: rlpSummary,
            savedDate: new Date().toISOString(),
            notes: '',
            status: 'interested'
          };

          mapApp.addSavedProperty(newSavedProperty);

          statusElement.innerHTML = await marked.parse(
            `Okay, I've saved **${propertyToSave.name}** for you. I've also extracted the relevant RLP information and added it to the Saved Properties page.`,
          );
        } catch (error) {
          console.error('Error during RLP extraction:', error);
          statusElement.innerHTML = `Sorry, I couldn't extract the RLP info for "${propertyToSave.name}". Please try again.`;
        }
      };

      mapApp.sendMessageHandler = async (input: string | any, role: string) => {
        console.log('sendMessageHandler', input, role);

        const {thinkingElement, textElement, thinkingContainer} = mapApp.addMessage(
          'assistant',
          '',
        );

        mapApp.setChatState(ChatState.GENERATING);
        textElement.innerHTML = '...';

        let newCode = '';
        let thoughtAccumulator = '';
        const sources: {uri: string; title: string}[] = [];

        try {
          try {
            if (typeof input === 'object' && input.isPDF) {
              const fileCount = input.isMultiFile ? input.fileCount : 1;
              const fileNames = input.isMultiFile ? input.fileNames.join(', ') : 'document';

              console.log(`Processing ${fileCount} PDF(s) with full context:`, fileNames);

              const messageArray: any[] = [{text: input.text || `Please analyze ${fileCount > 1 ? 'these' : 'this'} RLP (Request for Lease Proposals) document${fileCount > 1 ? 's' : ''}. Extract and summarize the key requirements in a clear, structured format. Remember ALL details including requirements, terms, deadlines, special conditions, renovation needs, safety requirements, and any other important information. I may ask you questions about these details later, or ask you to draft emails or create talking points for phone calls with property contacts.`}];

              if (Array.isArray(input.inlineData)) {
                input.inlineData.forEach((data: any) => {
                  messageArray.push({inlineData: data});
                });
              } else {
                messageArray.push({inlineData: input.inlineData});
              }

              const stream = await aiChat.sendMessageStream({
                message: messageArray
              });

              for await (const chunk of stream) {
                for (const candidate of chunk.candidates ?? []) {
                  for (const part of candidate.content?.parts ?? []) {
                    if (part.functionCall) {
                      console.log('FUNCTION CALL:', part.functionCall.name, part.functionCall.args);
                    }
                    if (part.text) {
                      mapApp.setChatState(ChatState.EXECUTING);
                      newCode += part.text;
                      textElement.innerHTML = await marked.parse(newCode);
                    }
                    mapApp.scrollToTheEnd();
                  }
                }
              }

              textElement.innerHTML += await marked.parse('\n\n---\n\n*Now searching for matching properties...*');
              mapApp.scrollToTheEnd();

              const {textElement: searchTextElement} = mapApp.addMessage('assistant', '');
              searchTextElement.innerHTML = '...';

              const searchStream = await aiChat.sendMessageStream({
                message: 'Based on the RLP requirements I just analyzed, please search for and display properties that match these criteria.'
              });

              let searchResponse = '';
              for await (const chunk of searchStream) {
                for (const candidate of chunk.candidates ?? []) {
                  for (const part of candidate.content?.parts ?? []) {
                    if (part.functionCall) {
                      console.log('FUNCTION CALL:', part.functionCall.name, part.functionCall.args);
                    }
                    if (part.text) {
                      mapApp.setChatState(ChatState.EXECUTING);
                      searchResponse += part.text;
                      searchTextElement.innerHTML = await marked.parse(searchResponse);
                    }
                    mapApp.scrollToTheEnd();
                  }
                }
              }
            } else {
              const messagePayload = typeof input === 'string'
                ? {message: input}
                : {message: [
                    {text: input.text},
                    {inlineData: input.inlineData}
                  ]};

              const stream = await aiChat.sendMessageStream(messagePayload);

              for await (const chunk of stream) {
                const groundingChunks =
                  chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks) {
                  for (const groundingChunk of groundingChunks) {
                    if (groundingChunk.web) {
                      sources.push({
                        uri: groundingChunk.web.uri,
                        title: groundingChunk.web.title,
                      });
                    }
                  }
                }

                for (const candidate of chunk.candidates ?? []) {
                  for (const part of candidate.content?.parts ?? []) {
                    if (part.functionCall) {
                      console.log(
                        'FUNCTION CALL:',
                        part.functionCall.name,
                        part.functionCall.args,
                      );
                    }

                    if (part.thought) {
                      mapApp.setChatState(ChatState.THINKING);
                      thoughtAccumulator += ' ' + part.thought;
                      thinkingElement.innerHTML =
                        await marked.parse(thoughtAccumulator);
                      if (thinkingContainer) {
                        thinkingContainer.classList.remove('hidden');
                        thinkingContainer.setAttribute('open', 'true');
                      }
                    } else if (part.text) {
                      mapApp.setChatState(ChatState.EXECUTING);
                      newCode += part.text;
                      textElement.innerHTML = await marked.parse(newCode);
                    }
                    mapApp.scrollToTheEnd();
                  }
                }
              }
            }
          } catch (e: unknown) {
            console.error('GenAI SDK Error:', e);
            let baseErrorText: string;

            if (e instanceof Error) {
              baseErrorText = e.message;
            } else if (typeof e === 'string') {
              baseErrorText = e;
            } else if (
              e &&
              typeof e === 'object' &&
              'message' in e &&
              typeof (e as {message: unknown}).message === 'string'
            ) {
              baseErrorText = (e as {message: string}).message;
            } else {
              try {
                baseErrorText = `Unexpected error: ${JSON.stringify(e)}`;
              } catch (stringifyError) {
                baseErrorText = `Unexpected error: ${String(e)}`;
              }
            }

            let finalErrorMessage = baseErrorText;

            const jsonStartIndex = baseErrorText.indexOf('{');
            const jsonEndIndex = baseErrorText.lastIndexOf('}');

            if (jsonStartIndex > -1 && jsonEndIndex > jsonStartIndex) {
              const potentialJson = baseErrorText.substring(
                jsonStartIndex,
                jsonEndIndex + 1,
              );
              try {
                const sdkError = JSON.parse(potentialJson);
                let refinedMessageFromSdkJson: string | undefined;

                if (
                  sdkError &&
                  typeof sdkError === 'object' &&
                  sdkError.error &&
                  typeof sdkError.error === 'object' &&
                  typeof sdkError.error.message === 'string'
                ) {
                  refinedMessageFromSdkJson = sdkError.error.message;
                } else if (
                  sdkError &&
                  typeof sdkError === 'object' &&
                  typeof sdkError.message === 'string'
                ) {
                  refinedMessageFromSdkJson = sdkError.message;
                }

                if (refinedMessageFromSdkJson) {
                  finalErrorMessage = refinedMessageFromSdkJson;
                }
              } catch (parseError) {
                console.warn(
                  'Could not parse potential JSON from error message; using base error text.',
                  parseError,
                );
              }
            }

            const {textElement: errorTextElement} = mapApp.addMessage('error', '');
            errorTextElement.innerHTML = await marked.parse(
              `Error: ${finalErrorMessage}`,
            );
          }

          if (sources.length > 0) {
            mapApp.appendSources(textElement, sources);
          }

          if (thinkingContainer && thinkingContainer.hasAttribute('open')) {
            if (!thoughtAccumulator) {
              thinkingContainer.classList.add('hidden');
            }
            thinkingContainer.removeAttribute('open');
          }

          if (
            textElement.innerHTML.trim() === '...' ||
            textElement.innerHTML.trim().length === 0
          ) {
            const hasFunctionCallMessage = mapApp.messages.some((el) =>
              el.innerHTML.includes('Calling function:'),
            );
            if (!hasFunctionCallMessage) {
              textElement.innerHTML = await marked.parse('Done.');
            } else if (textElement.innerHTML.trim() === '...') {
              textElement.innerHTML = '';
            }
          }
        } finally {
          mapApp.setChatState(ChatState.IDLE);
        }
      };
    };

    initializeApp();
  }, [user, signOut]);

  if (!user) {
    return null;
  }

  return <div id="map-app-container" style={{ width: '100%', height: '100vh' }} />;
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={<AuthWrapper defaultView="signin" />}>
        <AuthenticatedMapApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});
