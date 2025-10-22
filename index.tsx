/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This is the main entry point for the application.
 * It sets up the LitElement-based MapApp component, initializes the Google GenAI
 * client for chat interactions, and establishes communication between the
 * Model Context Protocol (MCP) client and server. The MCP server exposes
 * map-related tools that the AI model can use, and the client relays these
 * tool calls to the server.
 */

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
} from './map_app'; // Updated import path

import {MapParams, startMcpGoogleMapServer} from './mcp_maps_server';

/* --------- */

async function startClient(transport: Transport) {
  const client = new Client({name: 'AI Studio', version: '1.0.0'});
  await client.connect(transport);
  return client;
}

/* ------------ */

const SYSTEM_INSTRUCTIONS = `You are "Scout", an expert real estate agent and cartographer, highly proficient with maps and discovering interesting places.

Your primary goal is to assist users in finding properties that match their requirements. Users can provide requirements in two ways:
1. **Upload an RLP (Request for Lease Proposals) document** - When a user uploads a document, analyze it and provide a concise summary of the key requirements.
2. **Directly describe their needs** - Users can simply type or paste their property requirements directly into the chat.

In both cases, once you understand the requirements, help the user find suitable properties based on those criteria.

CRITICAL Property Matching Rules:
- **LOCATION ACCURACY IS PARAMOUNT:** Properties MUST be in the EXACT city and area specified in the RLP. If the RLP says "Albuquerque, NM", DO NOT show properties from Birmingham, Dallas, or any other city.
- **Verify location boundaries:** Pay close attention to specific area boundaries mentioned in the RLP (e.g., "North: X St, South: Y St, East: Z St, West: W St").
- **Match ALL key requirements:** Size, property type (office/warehouse/etc), parking, special features must align with RLP specifications.

RESPONSE FORMAT (After finding properties):
When you call the display_property_results tool, format your response like this:

**Found X properties matching your requirements:**

1. <a href="javascript:app.flyToProperty('[Property Name]')" style="color: #10b981; font-weight: 600; text-decoration: none; cursor: pointer;">**[Property Name]**</a> - [Size] | [Price]
   [Brief one-line description]

2. <a href="javascript:app.flyToProperty('[Property Name]')" style="color: #10b981; font-weight: 600; text-decoration: none; cursor: pointer;">**[Property Name]**</a> - [Size] | [Price]
   [Brief one-line description]

*Click any property name above or on the map to view full details and contact information.*

IMPORTANT: Property names in the list MUST be wrapped in <a> tags with javascript:app.flyToProperty('exact-property-name') where exact-property-name is the EXACT name you provided in the display_property_results tool.

DO NOT include long explanations, summaries of the RLP, or detailed property descriptions in your text response. The map markers and cards contain all that information.

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

function camelCaseToDash(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

document.addEventListener('DOMContentLoaded', async (event) => {
  const rootElement = document.querySelector('#root')! as HTMLElement;

  const mapApp = new MapApp();
  rootElement.appendChild(mapApp);

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

  /**
   * This handler is triggered when the user saves a property from the map.
   * It makes a specific request to the AI to extract relevant RLP information
   * and then adds the combined data to the saved properties list.
   */
  mapApp.savePropertyHandler = async (propertyToSave: Property) => {
    const {textElement: statusElement} = mapApp.addMessage('assistant', '');
    statusElement.innerHTML = `<i>Saving "${propertyToSave.name}" and extracting RLP info...</i>`;

    try {
      const prompt = `I have chosen to save the property "${propertyToSave.name}". Please extract the key contact information, relevant deadlines, and any specific requirements from the RLP document that I would need to follow up on this property. Please format it neatly using markdown.`;

      const response = await aiChat.sendMessage({message: prompt});
      const rlpInfo = response.text;

      const newSavedProperty: SavedProperty = {
        property: propertyToSave,
        rlpInfo: rlpInfo,
        notes: '', // initial empty notes
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
    textElement.innerHTML = '...'; // Initial placeholder

    let newCode = '';
    let thoughtAccumulator = '';
    const sources: {uri: string; title: string}[] = [];

    try {
      // Outer try for overall message handling including post-processing
      try {
        // Inner try for AI interaction and message parsing

        // Special handling for PDFs - use a completely separate AI client without tools
        if (typeof input === 'object' && input.isPDF) {
          console.log('Processing PDF without tools...');
          // Create a completely separate AI client for PDF processing (no tools)
          const pdfAI = new GoogleGenAI({
            apiKey: process.env.API_KEY,
          });

          const pdfChat = pdfAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: 'You are an expert at analyzing RLP (Request for Lease Proposals) documents. Extract and summarize the key requirements in a clear, structured format.',
            },
          });

          const stream = await pdfChat.sendMessageStream({
            message: [
              {text: input.text},
              {inlineData: input.inlineData}
            ]
          });

          for await (const chunk of stream) {
            for (const candidate of chunk.candidates ?? []) {
              for (const part of candidate.content?.parts ?? []) {
                if (part.text) {
                  mapApp.setChatState(ChatState.EXECUTING);
                  newCode += part.text;
                  textElement.innerHTML = await marked.parse(newCode);
                }
                mapApp.scrollToTheEnd();
              }
            }
          }

          // After extracting PDF content, add it to the main chat context
          // This allows future queries to reference the RLP requirements
          await aiChat.sendMessage({
            message: `The user has uploaded an RLP document. Here's the summary of requirements:\n\n${newCode}\n\nPlease remember these requirements for future property searches.`
          });

          // Automatically trigger property search after RLP analysis
          textElement.innerHTML += await marked.parse('\n\n---\n\n*Now searching for matching properties...*');
          mapApp.scrollToTheEnd();

          // Create a new assistant message for the search results
          const {textElement: searchTextElement} = mapApp.addMessage('assistant', '');
          searchTextElement.innerHTML = '...';

          // Send search request with tools enabled
          const searchStream = await aiChat.sendMessageStream({
            message: 'Based on the RLP requirements provided, please search for and display properties that match these criteria.'
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
          // Normal text message handling with tools enabled
          const messagePayload = typeof input === 'string'
            ? {message: input}
            : {message: [
                {text: input.text},
                {inlineData: input.inlineData}
              ]};

          const stream = await aiChat.sendMessageStream(messagePayload);

          for await (const chunk of stream) {
            // Handle grounding metadata for web search results
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

                  // Function calls are handled by the MCP server and map_app.
                  // We don't display them to the user to keep the UI clean.
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
        } // Close else block for normal message handling
      } catch (e: unknown) {
        // Catch for AI interaction errors.
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
            // Attempt to stringify complex objects, otherwise, simple String conversion.
            baseErrorText = `Unexpected error: ${JSON.stringify(e)}`;
          } catch (stringifyError) {
            baseErrorText = `Unexpected error: ${String(e)}`;
          }
        }

        let finalErrorMessage = baseErrorText; // Start with the extracted/formatted base error message.

        // Attempt to parse a JSON object from the baseErrorText, as some SDK errors embed details this way.
        // This is useful if baseErrorText itself is a string containing JSON.
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

            // Check for common nested error structures (e.g., sdkError.error.message)
            // or a direct message (sdkError.message) in the parsed JSON.
            if (
              sdkError &&
              typeof sdkError === 'object' &&
              sdkError.error && // Check if 'error' property exists and is truthy
              typeof sdkError.error === 'object' && // Check if 'error' property is an object
              typeof sdkError.error.message === 'string' // Check for 'message' string within 'error' object
            ) {
              refinedMessageFromSdkJson = sdkError.error.message;
            } else if (
              sdkError &&
              typeof sdkError === 'object' && // Check if sdkError itself is an object
              typeof sdkError.message === 'string' // Check for a direct 'message' string on sdkError
            ) {
              refinedMessageFromSdkJson = sdkError.message;
            }

            if (refinedMessageFromSdkJson) {
              finalErrorMessage = refinedMessageFromSdkJson; // Update if JSON parsing yielded a more specific message
            }
          } catch (parseError) {
            // If parsing fails, finalErrorMessage remains baseErrorText.
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

      // After stream, if sources were found, append them to the message.
      if (sources.length > 0) {
        mapApp.appendSources(textElement, sources);
      }

      // Post-processing logic (now inside the outer try)
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
      // Finally for the outer try, ensures chat state is reset
      mapApp.setChatState(ChatState.IDLE);
    }
  };
});
