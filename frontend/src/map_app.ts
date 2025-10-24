/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This file defines the main `gdm-map-app` LitElement component.
 * This component is responsible for:
 * - Rendering the user interface, including the Google Photorealistic 3D Map,
 *   chat messages area, and user input field.
 * - Managing the state of the chat (e.g., idle, generating, thinking).
 * - Handling user input and sending messages to the Gemini AI model.
 * - Processing responses from the AI, including displaying text and handling
 *   function calls (tool usage) related to map interactions.
 * - Integrating with the Google Maps JavaScript API to load and control the map,
 *   display markers, polylines for routes, and geocode locations.
 * - Providing the `handleMapQuery` method, which is called by the MCP server
 *   (via index.tsx) to update the map based on AI tool invocations.
 */

// Google Maps JS API Loader: Used to load the Google Maps JavaScript API.
import {Loader} from '@googlemaps/js-api-loader';
import hljs from 'highlight.js';
import {html, LitElement, PropertyValueMap} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {map} from 'lit/directives/map.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {until} from 'lit/directives/until.js';
import {Marked} from 'marked';
import {markedHighlight} from 'marked-highlight';

import type {Property} from './mcp_maps_server';
import {MapParams} from './mcp_maps_server';

export type {Property}; // Re-export for use in index.tsx

/** Markdown formatting function with syntax hilighting */
export const marked = new Marked(
  markedHighlight({
    async: true,
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    },
  }),
);

// --- NEW SVG ICONS ---

const ICON_LOGO = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="currentColor" />
  <path
    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.65 16.58 16.88 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.22 15.99 17.9 17.39Z"
    fill="#FFFFFF" />
</svg>`;

const ICON_SEARCH = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
    fill="currentColor" />
</svg>`;

const ICON_HEART = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
    fill="currentColor" />
</svg>`;

const ICON_SETTINGS = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M19.43 12.98C19.47 12.67 19.5 12.34 19.5 12C19.5 11.66 19.47 11.33 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.48 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.33 4.5 11.66 4.5 12C4.5 12.34 4.53 12.67 4.57 12.98L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.95L7.44 17.95C7.96 18.34 8.52 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z"
    fill="currentColor" />
</svg>`;

const ICON_THEME = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19V19Z"
    fill="currentColor" />
  <path d="M12 5V3" stroke="currentColor" stroke-width="2" />
  <path d="M12 21V19" stroke="currentColor" stroke-width="2" />
  <path d="M5 12H3" stroke="currentColor" stroke-width="2" />
  <path d="M21 12H19" stroke="currentColor" stroke-width="2" />
  <path d="M7.05 7.05L5.64 5.64" stroke="currentColor" stroke-width="2" />
  <path
    d="M18.36 18.36L16.95 16.95"
    stroke="currentColor"
    stroke-width="2" />
  <path d="M7.05 16.95L5.64 18.36" stroke="currentColor" stroke-width="2" />
  <path
    d="M18.36 5.64L16.95 7.05"
    stroke="currentColor"
    stroke-width="2" />
</svg>`;

const ICON_LOGOUT = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"
    fill="currentColor" />
</svg>`;

const ICON_FILTER = html`<svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z"
    fill="currentColor" />
</svg>`;

const ICON_SEND = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
</svg>`;

const ICON_DELETE = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="20px"
  viewBox="0 -960 960 960"
  width="20px"
  fill="currentColor">
  <path
    d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
</svg>`;

const ICON_STAR = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="32px"
  viewBox="0 -960 960 960"
  width="32px"
  fill="currentColor">
  <path
    d="m233-80 65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247-149Z" />
</svg>`;

const ICON_PIN = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="32px"
  viewBox="0 -960 960 960"
  width="32px"
  fill="currentColor">
  <path
    d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 400Q322-202 241-343T160-652q0-142 99-241t241-99q142 0 241 99t99 241q0 168-81 309T480-80Z" />
</svg>`;

const ICON_HEART_OUTLINE = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="currentColor">
  <path
    d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T530-690h-99q-21-51-61-77.5T280-794q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-252Z" />
</svg>`;

const ICON_HEART_FILLED = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="currentColor">
  <path
    d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
</svg>`;

const ICON_LAYERS = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M11.99 18.54L4.62 12.81L3 14.07L12 21.07L21 14.07L19.37 12.8L11.99 18.54ZM12 16L19.36 10.27L21 9L12 2L3 9L4.63 10.27L12 16Z"
    fill="currentColor" />
</svg>`;

const ICON_UPLOAD_CLOUD = html`<svg
  width="48"
  height="48"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18ZM8 13H11V16H13V13H16L12 9L8 13Z"
    fill="currentColor" />
</svg>`;

/**
 * Chat state enum to manage the current state of the chat interface.
 */
export enum ChatState {
  IDLE,
  GENERATING,
  THINKING,
  EXECUTING,
}

/**
 * Chat role enum to manage the current role of the message.
 */
export enum ChatRole {
  USER,
  ASSISTANT,
  SYSTEM,
}

export interface SavedProperty {
  property: Property;
  rlpInfo: string; // Detailed RLP info extracted by AI
  rlpSummary?: { // Quick reference summary
    location?: string;
    squareFootage?: string;
    parking?: number;
    spaceType?: string;
    deadlines?: string[];
  };
  savedDate: string; // ISO date string
  notes: string;
  status?: 'interested' | 'contacted' | 'awaiting_response' | 'declined';
}

// Google Maps API Key: Loaded from environment variable.
// This key is essential for loading and using Google Maps services.
// Ensure this key is configured with access to the "Maps JavaScript API",
// "Geocoding API", and the "Directions API".
// Set GOOGLE_MAPS_API_KEY in .env.local
const USER_PROVIDED_GOOGLE_MAPS_API_KEY: string =
  process.env.GOOGLE_MAPS_API_KEY || '';

/**
 * MapApp component for Photorealistic 3D Maps.
 */
@customElement('gdm-map-app')
export class MapApp extends LitElement {
  @query('#anchor') anchor?: HTMLDivElement;
  // Google Maps: Reference to the <gmp-map-3d> DOM element where the map is rendered.
  @query('#mapContainer') mapContainerElement?: HTMLElement; // Will be <gmp-map-3d>
  @query('#messageInput') messageInputElement?: HTMLInputElement;

  @state() chatState = ChatState.IDLE;
  @state() isRunning = true;
  @state() inputMessage = '';
  @state() messages: HTMLElement[] = [];
  @state() mapInitialized = false;
  @state() mapError = '';
  @state() savedProperties: SavedProperty[] = [];
  @state() queuedFiles: File[] = []; // Files queued for upload
  @state() activeView: 'chat' | 'saved' = 'chat';
  @state() private showLayerControl = false;
  @state() private mapMode: 'hybrid' | 'roadmap' = 'hybrid';
  @state() isInitialState = true;
  @state() public rlpRequirements: any = null;
  @state() private selectedProperty: Property | null = null;

  // Google Maps: Instance of the Google Maps 3D map.
  private map?: any;
  // Google Maps: Instance of the Google Maps Geocoding service.
  private geocoder?: any;

  // Google Maps: References to 3D map element constructors.
  private Polyline3DElement?: any;
  // Google Maps: Reference to 3D Marker constructor
  private Marker3DElement?: any;
  // Google Maps: A single InfoWindow for displaying details of properties.
  private infoWindow?: any;
  // Google Maps: Map to store markers for saved properties.
  private savedPropertyMarkers = new Map<string, any>();
  // Google Maps: Map to store markers for property search results.
  private propertyResultMarkers = new Map<string, any>();

  // Google Maps: Instance of the Google Maps Directions service.
  private directionsService?: any;
  // Google Maps: Instance of the current route polyline.
  private routePolyline?: any;

  sendMessageHandler?: CallableFunction;
  clearChatHandler?: () => void;
  savePropertyHandler?: (property: Property) => Promise<void>;

  constructor() {
    super();
    // Allows `this` to be correct in InfoWindow event handlers
    (window as any).app = this;
  }

  createRenderRoot() {
    return this;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    // Google Maps: Load the map when the component is first updated.
    this.loadMap();
  }

  /**
   * Google Maps: Loads the Google Maps JavaScript API using the JS API Loader.
   * It initializes necessary map services like Geocoding and Directions,
   * and imports map elements.
   * Handles API key validation and error reporting.
   */
  async loadMap() {
    const isApiKeyPlaceholder =
      USER_PROVIDED_GOOGLE_MAPS_API_KEY ===
        'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_REPLACE_ME' ||
      USER_PROVIDED_GOOGLE_MAPS_API_KEY === '';

    if (isApiKeyPlaceholder) {
      this.mapError = `Google Maps API Key is not configured correctly.
Please edit the map_app.ts file and replace the placeholder value for
USER_PROVIDED_GOOGLE_MAPS_API_KEY with your actual API key.
You can find this constant near the top of the map_app.ts file.`;
      console.error(this.mapError);
      this.requestUpdate();
      return;
    }

    const loader = new Loader({
      apiKey: USER_PROVIDED_GOOGLE_MAPS_API_KEY,
      version: 'beta', // Using 'beta' for Photorealistic 3D Maps features
    });

    try {
      // FIX: The error "Property 'load' does not exist on type 'Loader'" is likely
      // due to an incorrect or outdated TypeScript type definition for the Google
      // Maps JS API Loader. The `load()` method is the correct function to call
      // to populate the `window.google.maps` namespace, which this component
      // relies on. We cast the loader to `any` to bypass the erroneous type
      // check and allow the method to be called.
      await (loader as any).load();

      const maps3dLibrary = await (window as any).google.maps.importLibrary('maps3d');
      this.Polyline3DElement = (maps3dLibrary as any).Polyline3DElement;
      this.Marker3DElement = (maps3dLibrary as any).Marker3DElement;

      // Also load core, geocoding, routes, and geometry services.
      await (window as any).google.maps.importLibrary('maps'); // For InfoWindow, LatLngBounds, etc.
      await (window as any).google.maps.importLibrary('geocoding'); // For Geocoder service.
      await (window as any).google.maps.importLibrary('routes'); // For Directions service.
      await (window as any).google.maps.importLibrary('geometry'); // For spherical distance calculations.

      if ((window as any).google && (window as any).google.maps) {
        this.directionsService = new (
          window as any
        ).google.maps.DirectionsService();
        this.infoWindow = new (window as any).google.maps.InfoWindow({
          // Disabling pixel offset to use CSS for positioning
          pixelOffset: new (window as any).google.maps.Size(0, -10),
        });
      }

      this.initializeMap();
      this.mapInitialized = true;
      this.mapError = '';
    } catch (error) {
      console.error('Error loading Google Maps API:', error);
      this.mapError =
        'Could not load Google Maps. Check console for details and ensure API key is correct.';
      this.mapInitialized = false;
    }
    this.requestUpdate();
  }

  /**
   * Google Maps: Initializes the map instance and the Geocoder service.
   */
  initializeMap() {
    if (!this.mapContainerElement) {
      console.error('Map container not ready.');
      return;
    }
    this.map = this.mapContainerElement;
    if ((window as any).google && (window as any).google.maps) {
      this.geocoder = new (window as any).google.maps.Geocoder();
    }
  }

  setChatState(state: ChatState) {
    this.chatState = state;
  }

  private _clearMapElements(type: 'all' | 'results' | 'route' = 'all') {
    if (type === 'all' || type === 'results') {
      this.propertyResultMarkers.forEach((marker) => marker.remove());
      this.propertyResultMarkers.clear();
    }
    if (type === 'all' || type === 'route') {
      if (this.routePolyline) {
        this.routePolyline.remove();
        this.routePolyline = undefined;
      }
    }
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }

  private async _handleDirections(
    originQuery: string,
    destinationQuery: string,
  ) {
    if (!this.mapInitialized || !this.map || !this.directionsService) return;
    this._clearMapElements('route');

    this.directionsService.route(
      {
        origin: originQuery,
        destination: destinationQuery,
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
      },
      async (response: any, status: string) => {
        if (status === 'OK' && response.routes.length > 0) {
          const route = response.routes[0];

          if (route.overview_path && this.Polyline3DElement) {
            const pathCoordinates = route.overview_path.map((p: any) => ({
              lat: p.lat(),
              lng: p.lng(),
              altitude: 5,
            }));
            this.routePolyline = new this.Polyline3DElement();
            this.routePolyline.coordinates = pathCoordinates;
            this.routePolyline.strokeColor = 'blue';
            this.routePolyline.strokeWidth = 10;
            (this.map as any).appendChild(this.routePolyline);
          }

          if (route.bounds) {
            const bounds = route.bounds;
            const center = bounds.getCenter();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const diagonalDistance =
              (window as any).google.maps.geometry.spherical.computeDistanceBetween(
                ne,
                sw,
              );
            const range = Math.max(diagonalDistance * 1.7, 2000);

            const cameraOptions = {
              center: {lat: center.lat(), lng: center.lng(), altitude: 0},
              heading: 0,
              tilt: 45,
              range: range,
            };
            (this.map as any).flyCameraTo({
              endCamera: cameraOptions,
              durationMillis: 2000,
            });
          }
        } else {
          console.error(`Directions request failed. Status: ${status}`);
          const {textElement} = this.addMessage('error', 'Processing error...');
          textElement.innerHTML = await marked.parse(
            `Could not get directions. Reason: ${status}`,
          );
        }
      },
    );
  }

  async handleMapQuery(params: MapParams) {
    if (params.properties) {
      this._displayPropertyResults(params.properties);
    } else if (params.origin && params.destination) {
      this._handleDirections(params.origin, params.destination);
    }
  }

  addMessage(role: string, message: string) {
    const div = document.createElement('div');
    div.classList.add('turn', `role-${role.trim()}`);
    div.setAttribute('aria-live', 'polite');

    if (role === 'assistant') {
      const icon = document.createElement('div');
      icon.className = 'assistant-icon';
      const template = document.createElement('template');
      template.innerHTML = ICON_LOGO.strings.join('');
      icon.appendChild(template.content.firstElementChild!);
      div.append(icon);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const thinkingDetails = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Thinking process';
    thinkingDetails.classList.add('thinking', 'hidden'); // Always hide thinking process
    thinkingDetails.style.display = 'none'; // Never show thinking to user
    const thinkingElement = document.createElement('div');
    thinkingDetails.append(summary, thinkingElement);
    messageContent.append(thinkingDetails);

    const textElement = document.createElement('div');
    textElement.className = 'text';
    textElement.innerHTML = message;
    messageContent.append(textElement);
    div.append(messageContent);

    this.messages = [...this.messages, div];
    this.scrollToTheEnd();
    return {
      thinkingContainer: thinkingDetails,
      thinkingElement,
      textElement,
    };
  }

  appendSources(
    textElement: HTMLElement,
    sources: {uri: string; title: string}[],
  ) {
    const sourcesContainer = document.createElement('div');
    sourcesContainer.className = 'sources-container';
    const title = document.createElement('h4');
    title.textContent = 'Sources';
    const list = document.createElement('ul');
    sources.forEach((source) => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.uri;
      link.textContent = source.title || source.uri;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
    sourcesContainer.append(title, list);
    textElement.appendChild(sourcesContainer);
    this.scrollToTheEnd();
  }

  private async _displayPropertyResults(properties: Property[]) {
    this._clearMapElements('results');
    if (!this.Marker3DElement || !this.map) return;

    if (properties.length === 0) return;

    const bounds = new (window as any).google.maps.LatLngBounds();

    // Process properties sequentially to handle geocoding for missing coordinates
    for (const prop of properties) {
      // Don't show a result marker if it's already saved
      if (this.savedPropertyMarkers.has(prop.name)) {
        if (prop.latitude && prop.longitude) {
          bounds.extend({lat: prop.latitude, lng: prop.longitude});
        }
        continue;
      }

      // Skip properties with invalid coordinates and try to geocode
      if (!prop.latitude || !prop.longitude || prop.latitude === 0 || prop.longitude === 0) {
        console.warn(`Property "${prop.name}" has missing coordinates, attempting to geocode...`);
        try {
          const geocodeAddress = `${prop.address || prop.name}, ${prop.city || ''}, ${prop.state || ''}`.trim();
          const geocoded = await this._geocodeAddress(geocodeAddress);
          if (geocoded) {
            prop.latitude = geocoded.lat;
            prop.longitude = geocoded.lng;
            console.log(`✓ Geocoded "${prop.name}" to ${prop.latitude}, ${prop.longitude}`);
          } else {
            console.error(`✗ Could not geocode "${prop.name}", skipping marker`);
            continue;
          }
        } catch (e) {
          console.error(`Error geocoding "${prop.name}":`, e);
          continue;
        }
      }

      const position = {lat: prop.latitude, lng: prop.longitude};

      const marker = new this.Marker3DElement({
        position,
        altitudeMode: "RELATIVE_TO_GROUND",
        collisionBehavior: "REQUIRED_AND_HIDES_OPTIONAL",
      });

      // Use CSS to style the marker with green color
      marker.style.cssText = `
        width: 80px;
        height: 80px;
        background: radial-gradient(circle at center, #10b981 0%, #059669 70%, transparent 100%);
        border-radius: 50%;
        border: 6px solid #10b981;
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        animation: bounce-pulse 2s ease-in-out infinite;
      `;
      marker.innerHTML = '🏢';

      // Store property data on the marker element for click handling
      (marker as any).propertyData = prop;

      // Append marker to the map element (3D maps use append, not map property)
      this.map.append(marker);

      marker.addEventListener('gmp-click', (event: any) => {
        event.stopPropagation();
        this.selectedProperty = prop;
      });

      this.propertyResultMarkers.set(prop.name, marker);
      bounds.extend(position);
    }

    // Adjust camera to fit all property markers
    if (properties.length > 1) {
      const center = bounds.getCenter();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const diagonalDistance =
        (window as any).google.maps.geometry.spherical.computeDistanceBetween(
          ne,
          sw,
        );
      const range = Math.max(diagonalDistance * 1.9, 3000); // Zoom out a bit more
      this.map.flyCameraTo({
        endCamera: {
          center: {lat: center.lat(), lng: center.lng(), altitude: 0},
          heading: 0,
          tilt: 45,
          range,
        },
        durationMillis: 1500,
      });
    } else if (properties.length === 1) {
      // If only one property, zoom in closer
      this.map.flyCameraTo({
        endCamera: {
          center: {
            lat: properties[0].latitude,
            lng: properties[0].longitude,
            altitude: 0,
          },
          heading: 0,
          tilt: 67.5,
          range: 2000,
        },
        durationMillis: 1500,
      });
    }
  }

  /**
   * Geocodes an address to get latitude/longitude coordinates
   */
  private async _geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    if (!this.geocoder) {
      console.error('Geocoder not initialized');
      return null;
    }

    try {
      const result = await this.geocoder.geocode({address});
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Opens an info window for a property search result.
   */
  private _openPropertyInfoWindow(marker: any, property: Property) {
    if (!this.infoWindow) return;

    const isSaved = this.savedProperties.some(
      (p) => p.property.name === property.name,
    );

    const content = `
      <div class="info-window-content property-card">
        ${property.images && property.images.length > 0 ? `
          <div class="property-images">
            <img src="${property.images[0]}" alt="${property.name}" class="property-main-image"
                 onerror="this.style.display='none'" />
            ${property.images.length > 1 ? `
              <div class="property-image-count">+${property.images.length - 1} more</div>
            ` : ''}
          </div>
        ` : ''}

        <div class="property-card-header">
          <h3>${property.name}</h3>
          <button class="save-toggle-button ${isSaved ? 'saved' : ''}"
                  onclick="app.handleSaveToggle(this)"
                  data-property='${JSON.stringify(property).replace(/'/g, '&#39;')}'
                  aria-label="${isSaved ? 'Unsave property' : 'Save property'}"
                  title="${isSaved ? 'Unsave property' : 'Save property'}">
            ${(isSaved ? ICON_HEART_FILLED : ICON_HEART_OUTLINE).strings.join('')}
          </button>
        </div>

        <div class="property-card-body">
          ${property.propertyType ? `<div class="property-type-badge">${property.propertyType}</div>` : ''}

          <div class="property-details-grid">
            ${property.price ? `
              <div class="property-detail">
                <span class="detail-label">Price:</span>
                <span class="detail-value">${property.price}</span>
              </div>
            ` : ''}

            ${property.size ? `
              <div class="property-detail">
                <span class="detail-label">Size:</span>
                <span class="detail-value">${property.size}</span>
              </div>
            ` : ''}

            ${property.availableDate ? `
              <div class="property-detail">
                <span class="detail-label">Available:</span>
                <span class="detail-value">${property.availableDate}</span>
              </div>
            ` : ''}
          </div>

          ${property.summary ? `<p class="property-summary">${property.summary}</p>` : ''}

          ${(property.broker || property.propertyManager || property.contactEmail || property.contactPhone || property.website) ? `
            <div class="property-contact-section">
              <h4>Contact Information</h4>
              ${property.broker ? `
                <div class="contact-detail">
                  <span class="contact-label">Broker/Agent:</span>
                  <span class="contact-value">${property.broker}</span>
                </div>
              ` : ''}

              ${property.propertyManager ? `
                <div class="contact-detail">
                  <span class="contact-label">Property Manager:</span>
                  <span class="contact-value">${property.propertyManager}</span>
                </div>
              ` : ''}

              ${property.contactPhone ? `
                <div class="contact-detail">
                  <span class="contact-label">Phone:</span>
                  <a href="tel:${property.contactPhone}" class="contact-link">${property.contactPhone}</a>
                </div>
              ` : ''}

              ${property.contactEmail ? `
                <div class="contact-detail">
                  <span class="contact-label">Email:</span>
                  <a href="mailto:${property.contactEmail}" class="contact-link">${property.contactEmail}</a>
                </div>
              ` : ''}

              ${property.website ? `
                <div class="contact-detail">
                  <span class="contact-label">Website:</span>
                  <a href="${property.website}" target="_blank" rel="noopener noreferrer" class="contact-link">View Listing</a>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.infoWindow.setContent(content);
    // For 3D maps, we need to set position and open with the map reference
    const position = marker.position;
    this.infoWindow.setPosition(position);

    // For gmp-map-3d elements, we need to open the InfoWindow with a map option
    // Create a temporary anchor to associate with the map
    if (this.map) {
      this.infoWindow.open({
        map: this.map,
        anchor: marker,
        shouldFocus: false,
      });
    }
  }

  /**
   * Handles the click on the save/unsave button in the InfoWindow.
   * This function is called from the InfoWindow's HTML content.
   */
  async handleSaveToggle(button: HTMLButtonElement) {
    const property: Property = JSON.parse(button.dataset.property!);
    const isCurrentlySaved = this.savedProperties.some(
      (p) => p.property.name === property.name,
    );

    if (isCurrentlySaved) {
      this.removeProperty(property.name);
    } else {
      if (this.savePropertyHandler) {
        button.disabled = true; // Prevent double clicks
        button.innerHTML = '<div class="spinner-small"></div>';
        await this.savePropertyHandler(property);
        // The handler in index.tsx will call addSavedProperty, which updates UI.
      }
    }
  }

  addSavedProperty(savedProperty: SavedProperty) {
    // Add to state
    this.savedProperties = [...this.savedProperties, savedProperty];

    // Remove the result marker from the map
    const resultMarker = this.propertyResultMarkers.get(
      savedProperty.property.name,
    );
    if (resultMarker) {
      resultMarker.map = null;
      this.propertyResultMarkers.delete(savedProperty.property.name);
    }

    // Add a new "saved" marker
    this._addSavedPropertyMarker(savedProperty);

    // Close info window and update UI
    this.infoWindow.close();
    this.requestUpdate();
  }

  private _addSavedPropertyMarker(savedProp: SavedProperty) {
    if (!this.Marker3DElement || !this.map) return;

    // Create custom marker HTML for saved properties
    const markerContent = document.createElement('div');
    markerContent.className = 'saved-property-marker-3d';
    markerContent.innerHTML = `
      <div class="saved-marker-star"></div>
    `;

    const marker = new this.Marker3DElement({
      position: {
        lat: savedProp.property.latitude,
        lng: savedProp.property.longitude,
      },
      altitudeMode: "RELATIVE_TO_GROUND",
      extruded: true,
    });

    // Add custom content as child of marker
    marker.appendChild(markerContent);

    // Append marker to the map element
    this.map.append(marker);

    // Clicking a saved marker should re-center the map on it
    marker.addEventListener('gmp-click', (event: any) => {
      event.stopPropagation();
      this.map.flyCameraTo({
        endCamera: {
          center: marker.position,
          range: 2000,
          tilt: 67.5,
        },
        durationMillis: 1000,
      });
    });

    this.savedPropertyMarkers.set(savedProp.property.name, marker);
  }

  removeProperty(propertyName: string) {
    const propertyToRemove = this.savedProperties.find(
      (p) => p.property.name === propertyName,
    );
    if (propertyToRemove) {
      const marker = this.savedPropertyMarkers.get(propertyName);
      if (marker) {
        marker.remove();
        this.savedPropertyMarkers.delete(propertyName);
      }
    }

    this.savedProperties = this.savedProperties.filter(
      (p) => p.property.name !== propertyName,
    );
    this.infoWindow.close();
  }

  private _isPropertySaved(property: Property): boolean {
    return this.savedProperties.some((p) => p.property.name === property.name);
  }

  private async _handleSaveProperty(property: Property) {
    const isSaved = this._isPropertySaved(property);

    if (isSaved) {
      // Remove from saved properties
      this.removeProperty(property.name);
    } else {
      // Save the property with RLP context
      if (this.rlpRequirements) {
        const newSavedProperty: SavedProperty = {
          property: property,
          rlpInfo: '', // Will be populated by AI extraction
          rlpSummary: {
            location: this.rlpRequirements.location || '',
            squareFootage: this.rlpRequirements.squareFootage
              ? `${this.rlpRequirements.squareFootage.min?.toLocaleString() || 0} - ${this.rlpRequirements.squareFootage.max?.toLocaleString() || 0} sq ft`
              : '',
            parking: this.rlpRequirements.parking || 0,
            spaceType: this.rlpRequirements.spaceType || '',
            deadlines: this.rlpRequirements.deadlines || []
          },
          savedDate: new Date().toISOString(),
          notes: '',
          status: 'interested'
        };

        // Trigger AI extraction if handler is available
        if (this.savePropertyHandler) {
          await this.savePropertyHandler(property);
        } else {
          // Fallback: save without AI extraction
          this.addSavedProperty(newSavedProperty);
        }
      } else {
        // No RLP context - save with minimal info
        const newSavedProperty: SavedProperty = {
          property: property,
          rlpInfo: 'No RLP context available',
          savedDate: new Date().toISOString(),
          notes: '',
          status: 'interested'
        };
        this.addSavedProperty(newSavedProperty);
      }
    }
    this.requestUpdate();
  }

  /**
   * Fly to a property by name and open its info window
   * Called from clickable property links in chat
   */
  flyToProperty(propertyName: string) {
    const marker = this.propertyResultMarkers.get(propertyName);
    if (marker && marker.position) {
      // Fly camera to property
      this.map.flyCameraTo({
        endCamera: {
          center: {
            lat: marker.position.lat,
            lng: marker.position.lng,
            altitude: 0,
          },
          heading: 0,
          tilt: 67.5,
          range: 1500,
        },
        durationMillis: 1500,
      });

      // Show property card after camera animation
      setTimeout(() => {
        const prop = (marker as any).propertyData;
        if (prop) {
          this.selectedProperty = prop;
        }
      }, 1600);
    }
  }

  updateNote(index: number, newNote: string) {
    if (this.savedProperties[index]) {
      const updatedProperties = [...this.savedProperties];
      updatedProperties[index] = {
        ...updatedProperties[index],
        notes: newNote,
      };
      this.savedProperties = updatedProperties;
    }
  }

  scrollToTheEnd() {
    if (!this.anchor) return;
    this.anchor.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }

  private handleClearChat() {
    if (this.chatState !== ChatState.IDLE) return;
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = [];
      if (this.clearChatHandler) {
        this.clearChatHandler();
      }
    }
  }

  async sendMessageAction() {
    if (this.chatState !== ChatState.IDLE) return;

    // Check if we have queued files to process
    if (this.queuedFiles.length > 0) {
      await this._processQueuedFiles();
      return;
    }

    const msg = this.inputMessage.trim();
    if (msg.length === 0) return;

    this.inputMessage = '';

    const {textElement} = this.addMessage('user', '...');
    textElement.innerHTML = await marked.parse(msg);

    // If we have RLP requirements, include them in the context
    let messageToSend = msg;
    if (this.rlpRequirements) {
      messageToSend = `Context: I have an RLP with these requirements: ${JSON.stringify(this.rlpRequirements)}\n\nUser question: ${msg}`;
    }

    if (this.sendMessageHandler) {
      await this.sendMessageHandler(messageToSend, 'user');
    }
  }

  private async _processQueuedFiles() {
    const files = [...this.queuedFiles];
    const fileCount = files.length;

    // Clear the queue
    this.queuedFiles = [];

    // Add a user message showing all files being processed
    const fileList = files.map(f => `<li>${f.name}</li>`).join('');
    const userMsg = `
      <div class="rlp-upload-status">
        <div class="upload-header">
          <strong>RLP Documents Received (${fileCount} file${fileCount > 1 ? 's' : ''})</strong>
        </div>
        <ul class="uploaded-files-list">
          ${fileList}
        </ul>
        <div class="upload-loading-bar">
          <div class="loading-bar-fill"></div>
        </div>
        <div class="upload-status-text">Comprehensively analyzing all documents, please wait...</div>
      </div>
    `;
    const {textElement} = this.addMessage('user', userMsg);

    try {
      // Convert all files to base64 for AI processing
      const filePromises = files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return {
          name: file.name,
          mimeType: file.type,
          data: btoa(binary)
        };
      });

      const processedFiles = await Promise.all(filePromises);

      // Send all files to AI for comprehensive analysis
      const filesText = files.map(f => f.name).join(', ');
      const analysisPrompt = `I am uploading ${fileCount} document${fileCount > 1 ? 's' : ''} related to a government RLP (Request for Lease Proposals): ${filesText}

These documents may include the main RLP, amendments, floor plans, Q&A addendums, site visit notes, technical specifications, and other critical information.

CRITICAL INSTRUCTIONS:
1. Read and analyze ALL ${fileCount} documents thoroughly
2. Extract and synthesize ALL requirements from across all documents
3. Pay special attention to:
   - Location requirements and boundaries
   - Square footage and parking requirements
   - Special requirements (accessibility, safety, seismic, sustainability, renovations, 24/7 access)
   - Deadlines and key dates
   - Terms and conditions
   - Any amendments or clarifications in supplemental documents
   - Technical specifications
   - Government contact information

4. If there are conflicting requirements between documents, note the most recent/amended version
5. Create a comprehensive summary that ensures we miss NOTHING that could cost us the contract

Remember: This is for a competitive government contract. Missing ANY requirement from ANY document could disqualify our proposal. Be exhaustive in your analysis.`;

      // Send all PDFs to AI via the message handler
      await this.sendMessageHandler({
        isPDF: true,
        isMultiFile: true,
        fileCount: fileCount,
        fileNames: files.map(f => f.name),
        text: analysisPrompt,
        inlineData: processedFiles.map(f => ({mimeType: f.mimeType, data: f.data}))
      }, 'user');

      // Update to completed state
      textElement.innerHTML = `
        <div class="rlp-upload-status completed">
          <div class="upload-header">
            <strong>✓ All RLP Documents Analyzed Successfully</strong>
          </div>
          <ul class="uploaded-files-list">
            ${fileList}
          </ul>
        </div>
      `;

    } catch (error) {
      console.error('Error processing files:', error);
      textElement.innerHTML = `
        <div class="rlp-upload-status error">
          <div class="upload-header">
            <strong>✗ Analysis Failed</strong>
          </div>
          <div class="upload-status-text">${error.message}</div>
        </div>
      `;
    }
  }

  private async inputKeyDownAction(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessageAction();
    }
  }

  private _toggleTheme() {
    document.body.classList.toggle('dark-mode');
  }

  private _handleNavClick(view: 'chat' | 'saved') {
    this.activeView = view;
  }

  private _handleLogout() {
    console.log('🚪 Logout button clicked!');

    // Call the global logout handler if it exists (set by auth integration)
    if ((window as any).handleLogout) {
      console.log('✅ Calling auth logout handler');
      (window as any).handleLogout();
    } else {
      // Fallback: show alert for testing
      console.log('⚠️ No auth handler configured yet');
      alert('Logout clicked! Auth system not yet configured.\n\nTo enable: Follow QUICKSTART_AUTH.md');
    }
  }

  private renderUploadPrompt() {
    return html`
      <div class="upload-prompt-container">
        <div class="upload-box">
          <label for="rlp-upload" class="upload-label">
            <div class="upload-box-icon">${ICON_UPLOAD_CLOUD}</div>
            <div class="upload-box-text">
              <strong>Upload your RLP documents to begin</strong>
              <span>Select multiple files - RLP, amendments, floor plans, Q&A, etc.</span>
              <small style="display: block; margin-top: 8px; color: var(--color-text-secondary);">
                Comprehensive analysis of all documents ensures nothing is missed
              </small>
            </div>
          </label>
          <input
            id="rlp-upload"
            type="file"
            class="hidden"
            accept=".txt,.md,.pdf"
            multiple
            @change=${this._handleFileSelect} />
        </div>
      </div>
    `;
  }

  private async _handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    // Queue the files instead of auto-processing
    const newFiles = Array.from(input.files);
    this.queuedFiles = [...this.queuedFiles, ...newFiles];

    // Switch from upload view to chat view if needed
    if (this.isInitialState) {
      this.isInitialState = false;
    }

    // Clear the input so the same file can be selected again if needed
    input.value = '';

    this.requestUpdate();
  }

  private _removeQueuedFile(index: number) {
    this.queuedFiles = this.queuedFiles.filter((_, i) => i !== index);
  }

  private _clearQueuedFiles() {
    this.queuedFiles = [];
  }

  render() {
    // Google Maps: Initial camera parameters for the <gmp-map-3d> element.
    const initialCenter = '39.8283,-98.5795,100'; // Center of contiguous US
    const initialRange = '5000000'; // View range to fit contiguous US
    const initialTilt = '0'; // Top-down view
    const initialHeading = '0'; // Camera heading in degrees
    const maxRange = '7000000'; // Max range to prevent zooming out too far

    const savedPropertiesView = html`
      <div class="panel-header saved-properties-header">
        <h2>Saved Properties</h2>
      </div>
      <div class="panel-content">
        ${this.savedProperties.length === 0
          ? html`<p class="sidebar-empty-message">
              No properties saved yet. Click the heart icon on a property card
              on the map to save it.
            </p>`
          : html`
              <ul class="saved-properties-list">
                ${map(
                  this.savedProperties,
                  (item, index) => html`
                    <li class="saved-property-item">
                      <div class="saved-property-content">
                        <!-- Property Details Card -->
                        <div
                          class="saved-property-card property-details-card"
                          @click=${() =>
                            this.map.flyCameraTo({
                              endCamera: {
                                center: {
                                  lat: item.property.latitude,
                                  lng: item.property.longitude,
                                },
                                range: 2000,
                                tilt: 67.5,
                              },
                              durationMillis: 1000,
                            })}
                          title="Click to view on map">
                          <div class="saved-property-header">
                            <h3 class="saved-property-name">
                              ${item.property.name}
                            </h3>
                            <button
                              class="remove-property-button"
                              @click=${(e: Event) => {
                                e.stopPropagation(); // Prevent card click
                                this.removeProperty(item.property.name);
                              }}
                              aria-label="Remove ${item.property.name}"
                              title="Remove property">
                              ${ICON_DELETE}
                            </button>
                          </div>
                          ${item.property.price
                            ? html`<p>
                                <strong>Price:</strong> ${item.property.price}
                              </p>`
                            : ''}
                          ${item.property.size
                            ? html`<p>
                                <strong>Size:</strong> ${item.property.size}
                              </p>`
                            : ''}
                          ${item.property.summary
                            ? html`<p>${item.property.summary}</p>`
                            : ''}
                        </div>

                        <!-- RLP Summary Card (Quick Reference) -->
                        ${item.rlpSummary ? html`
                          <div class="saved-property-card rlp-summary-card">
                            <div class="saved-property-header">
                              <h4>RLP Requirements Summary</h4>
                            </div>
                            <div class="rlp-summary-grid">
                              ${item.rlpSummary.location ? html`
                                <div class="rlp-summary-item">
                                  <span class="rlp-summary-label">Location:</span>
                                  <span class="rlp-summary-value">${item.rlpSummary.location}</span>
                                </div>
                              ` : ''}
                              ${item.rlpSummary.squareFootage ? html`
                                <div class="rlp-summary-item">
                                  <span class="rlp-summary-label">Size:</span>
                                  <span class="rlp-summary-value">${item.rlpSummary.squareFootage}</span>
                                </div>
                              ` : ''}
                              ${item.rlpSummary.parking ? html`
                                <div class="rlp-summary-item">
                                  <span class="rlp-summary-label">Parking:</span>
                                  <span class="rlp-summary-value">${item.rlpSummary.parking} spaces</span>
                                </div>
                              ` : ''}
                              ${item.rlpSummary.spaceType ? html`
                                <div class="rlp-summary-item">
                                  <span class="rlp-summary-label">Space Type:</span>
                                  <span class="rlp-summary-value">${item.rlpSummary.spaceType}</span>
                                </div>
                              ` : ''}
                              ${item.rlpSummary.deadlines && item.rlpSummary.deadlines.length > 0 ? html`
                                <div class="rlp-summary-item full-width">
                                  <span class="rlp-summary-label">Key Deadlines:</span>
                                  <span class="rlp-summary-value">${item.rlpSummary.deadlines.slice(0, 2).join('; ')}</span>
                                </div>
                              ` : ''}
                            </div>
                            ${item.savedDate ? html`
                              <div class="saved-date">
                                <small>Saved: ${new Date(item.savedDate).toLocaleDateString()}</small>
                              </div>
                            ` : ''}
                          </div>
                        ` : ''}

                        <!-- RLP Info Card (Detailed AI Extraction) -->
                        <div class="saved-property-card rlp-info-card">
                          <div class="saved-property-header">
                            <h4>RLP Details & Follow-up Info</h4>
                          </div>
                          <div class="rlp-content">
                            ${
                              // FIX: Use `until` directive to handle async markdown parsing and `unsafeHTML` to render the result.
                              // FIX: Property 'then' does not exist on type 'string'. Wrap with Promise.resolve to ensure a promise is returned.
                              until(
                                Promise.resolve(
                                  marked.parse(item.rlpInfo),
                                ).then(unsafeHTML),
                                'Loading...',
                              )
                            }
                          </div>
                        </div>
                      </div>

                      <textarea
                        class="saved-property-notes"
                        placeholder="Add personal notes..."
                        .value=${item.notes}
                        @input=${(e: InputEvent) =>
                          this.updateNote(
                            index,
                            (e.target as HTMLTextAreaElement).value,
                          )}></textarea>
                    </li>
                  `,
                )}
              </ul>
            `}
      </div>
    `;

    const chatView = html`
      <div class="panel-header chat-header">
        <div class="chat-title">
          <div class="chat-title-icon">${ICON_LOGO}</div>
          <h2>Real Estate Scout</h2>
        </div>
        <button class="filters-button">
          ${ICON_FILTER}
          <span>Filters</span>
        </button>
      </div>
      ${this.rlpRequirements ? html`
        <div class="rlp-summary">
          <div class="rlp-summary-header">
            <strong>RLP Requirements Summary</strong>
            <button class="rlp-summary-close" @click=${() => this.rlpRequirements = null}>×</button>
          </div>
          <div class="rlp-summary-content">
            <div class="rlp-summary-row">
              <span class="rlp-label">Location:</span>
              <span class="rlp-value">${this.rlpRequirements.location || 'Not specified'}</span>
            </div>
            <div class="rlp-summary-row">
              <span class="rlp-label">Size:</span>
              <span class="rlp-value">${this.rlpRequirements.squareFootage ?
                `${this.rlpRequirements.squareFootage.min?.toLocaleString() || 0} - ${this.rlpRequirements.squareFootage.max?.toLocaleString() || 0} sq ft` :
                'Not specified'}</span>
            </div>
            <div class="rlp-summary-row">
              <span class="rlp-label">Parking:</span>
              <span class="rlp-value">${this.rlpRequirements.parking ? `${this.rlpRequirements.parking} spaces` : 'Not specified'}</span>
            </div>
            <div class="rlp-summary-row">
              <span class="rlp-label">Space Type:</span>
              <span class="rlp-value">${this.rlpRequirements.spaceType || 'Not specified'}</span>
            </div>
            ${this.rlpRequirements.specialRequirements && this.rlpRequirements.specialRequirements.length > 0 ? html`
              <div class="rlp-summary-row">
                <span class="rlp-label">Key Requirements:</span>
                <span class="rlp-value">${this.rlpRequirements.specialRequirements.slice(0, 3).join('; ')}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      <div class="chat-messages" aria-live="polite" aria-atomic="false">
        ${this.isInitialState ? this.renderUploadPrompt() : this.messages}
        <div id="anchor"></div>
      </div>
      <div class="footer">
        <div
          id="chatStatus"
          aria-live="assertive"
          class=${classMap({'hidden': this.chatState === ChatState.IDLE})}>
          ${this.chatState !== ChatState.IDLE
            ? html`<div class="spinner"></div>`
            : ''}
          ${this.chatState === ChatState.GENERATING ? html`Generating...` : ''}
          ${this.chatState === ChatState.EXECUTING ? html`Executing...` : ''}
        </div>
        ${this.queuedFiles.length > 0 ? html`
          <div class="queued-files-container">
            <div class="queued-files-header">
              <span>${this.queuedFiles.length} file${this.queuedFiles.length > 1 ? 's' : ''} ready to analyze</span>
              <button class="clear-files-button" @click=${this._clearQueuedFiles} title="Clear all files">
                Clear all
              </button>
            </div>
            <div class="queued-files-list">
              ${this.queuedFiles.map((file, index) => html`
                <div class="queued-file-item">
                  <span class="file-icon">📄</span>
                  <span class="file-name">${file.name}</span>
                  <button
                    class="remove-file-button"
                    @click=${() => this._removeQueuedFile(index)}
                    title="Remove file">
                    ✕
                  </button>
                </div>
              `)}
            </div>
          </div>
        ` : ''}
        <div id="inputArea" role="form" aria-labelledby="message-input-label">
          <label id="message-input-label" class="hidden"
            >Search for properties</label
          >
          <input
            type="text"
            id="messageInput"
            .value=${this.inputMessage}
            @input=${(e: InputEvent) => {
              this.inputMessage = (e.target as HTMLInputElement).value;
            }}
            @keydown=${(e: KeyboardEvent) => {
              this.inputKeyDownAction(e);
            }}
            placeholder="${this.isInitialState ? 'Ask me about properties or upload an RLP document...' : 'Find properties based on the RLP...'}"
            autocomplete="off"
            aria-labelledby="message-input-label" />
          <button
            id="sendButton"
            @click=${() => {
              this.sendMessageAction();
            }}
            aria-label="Send message"
            ?disabled=${this.chatState !== ChatState.IDLE}
            class=${classMap({
              'disabled': this.chatState !== ChatState.IDLE,
            })}>
            ${ICON_SEND}
          </button>
        </div>
        <p class="disclaimer">
          Scout can make mistakes. Please check important info.
        </p>
      </div>
    `;

    return html`
      <div class="gdm-map-app">
        <nav class="app-sidebar">
          <div class="sidebar-top">
            <button class="sidebar-button logo" aria-label="Home">
              ${ICON_LOGO}
            </button>
            <button
              class="sidebar-button ${classMap({
                active: this.activeView === 'chat',
              })}"
              aria-label="Search"
              title="Search"
              @click=${() => this._handleNavClick('chat')}>
              ${ICON_SEARCH}
            </button>
            <button
              class="sidebar-button ${classMap({
                active: this.activeView === 'saved',
              })}"
              aria-label="Saved Properties"
              title="Saved Properties"
              @click=${() => this._handleNavClick('saved')}>
              ${ICON_HEART}
            </button>
          </div>
          <div class="sidebar-bottom">
            <button
              class="sidebar-button"
              aria-label="Toggle Theme"
              title="Toggle Theme"
              @click=${this._toggleTheme}>
              ${ICON_THEME}
            </button>
            <button
              class="sidebar-button"
              aria-label="Settings"
              title="Settings">
              ${ICON_SETTINGS}
            </button>
            <button
              class="sidebar-button"
              aria-label="Logout"
              title="Logout"
              @click=${this._handleLogout}>
              ${ICON_LOGOUT}
            </button>
          </div>
        </nav>
        <main class="main-content">
          <div
            class="interaction-panel"
            role="complementary"
            aria-labelledby="chat-heading">
            ${this.activeView === 'chat' ? chatView : savedPropertiesView}
          </div>
          <div
            class="map-panel"
            role="application"
            aria-label="Interactive Map Area">
            ${this.mapError
              ? html`<div
                  class="map-error-message"
                  role="alert"
                  aria-live="assertive"
                  >${this.mapError}</div
                >`
              : ''}
            <div class="map-layer-control">
              <button
                class="map-layer-toggle-button"
                @click=${() => (this.showLayerControl = !this.showLayerControl)}
                title="Map Layers">
                ${ICON_LAYERS}
              </button>
              ${this.showLayerControl
                ? html`
                    <div class="layer-options">
                      <h4>Map Type</h4>
                      <label>
                        <input
                          type="radio"
                          name="map-mode"
                          value="hybrid"
                          .checked=${this.mapMode === 'hybrid'}
                          @change=${() => (this.mapMode = 'hybrid')} />
                        Satellite
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="map-mode"
                          value="roadmap"
                          .checked=${this.mapMode === 'roadmap'}
                          @change=${() => (this.mapMode = 'roadmap')} />
                        Roadmap
                      </label>
                    </div>
                  `
                : ''}
            </div>
            <!-- Google Maps: The core 3D Map custom element -->
            <gmp-map-3d
              id="mapContainer"
              aria-label="Google Photorealistic 3D Map Display"
              mode="${this.mapMode}"
              center="${initialCenter}"
              heading="${initialHeading}"
              tilt="${initialTilt}"
              range="${initialRange}"
              max-range="${maxRange}"
              internal-usage-attribution-ids="gmp_aistudio_threedmapjsmcp_v0.1_showcase"
              default-ui-hidden="true"
              role="application">
            </gmp-map-3d>

            <!-- Property Card Overlay -->
            ${this.selectedProperty ? html`
              <div class="property-card-overlay" @click=${() => this.selectedProperty = null}>
                <div class="property-card-container" @click=${(e: Event) => e.stopPropagation()}>
                  ${this.selectedProperty.images && this.selectedProperty.images.length > 0 ? html`
                    <div class="property-card-images">
                      <img src="${this.selectedProperty.images[0]}" alt="${this.selectedProperty.name}"
                           onerror="this.style.display='none'" />
                    </div>
                  ` : ''}

                  <div class="property-card-content">
                    <div class="property-card-header-row">
                      <h2>${this.selectedProperty.name}</h2>
                      <div class="card-header-buttons">
                        <button
                          class="save-property-button ${this._isPropertySaved(this.selectedProperty) ? 'saved' : ''}"
                          @click=${() => this._handleSaveProperty(this.selectedProperty)}
                          title="${this._isPropertySaved(this.selectedProperty) ? 'Unsave property' : 'Save property'}">
                          ${this._isPropertySaved(this.selectedProperty) ? ICON_HEART_FILLED : ICON_HEART_OUTLINE}
                        </button>
                        <button class="close-card-button" @click=${() => this.selectedProperty = null}>
                          ✕
                        </button>
                      </div>
                    </div>

                    ${this.selectedProperty.propertyType ? html`
                      <div class="property-type-badge-large">${this.selectedProperty.propertyType}</div>
                    ` : ''}

                    <div class="property-card-details">
                      ${this.selectedProperty.price ? html`
                        <div class="detail-row">
                          <span class="detail-label">Price:</span>
                          <span class="detail-value">${this.selectedProperty.price}</span>
                        </div>
                      ` : ''}

                      ${this.selectedProperty.size ? html`
                        <div class="detail-row">
                          <span class="detail-label">Size:</span>
                          <span class="detail-value">${this.selectedProperty.size}</span>
                        </div>
                      ` : ''}

                      ${this.selectedProperty.availableDate ? html`
                        <div class="detail-row">
                          <span class="detail-label">Available:</span>
                          <span class="detail-value">${this.selectedProperty.availableDate}</span>
                        </div>
                      ` : ''}
                    </div>

                    ${this.selectedProperty.summary ? html`
                      <div class="property-summary-section">
                        <h3>Description</h3>
                        <p>${this.selectedProperty.summary}</p>
                      </div>
                    ` : ''}

                    <div class="property-contact-info">
                      <h3>Contact Information</h3>
                      ${this.selectedProperty.broker && this.selectedProperty.broker !== 'Contact broker' ? html`
                        <div class="contact-row">
                          <strong>Broker:</strong> ${this.selectedProperty.broker}
                        </div>
                      ` : ''}
                      ${this.selectedProperty.propertyManager ? html`
                        <div class="contact-row">
                          <strong>Company:</strong> ${this.selectedProperty.propertyManager}
                        </div>
                      ` : ''}
                      ${this.selectedProperty.contactPhone && this.selectedProperty.contactPhone !== 'Call for details' ? html`
                        <div class="contact-row">
                          <strong>Phone:</strong>
                          <a href="tel:${this.selectedProperty.contactPhone.replace(/[^0-9+]/g, '')}">${this.selectedProperty.contactPhone}</a>
                        </div>
                      ` : ''}
                      ${this.selectedProperty.contactEmail ? html`
                        <div class="contact-row">
                          <strong>Email:</strong>
                          <a href="mailto:${this.selectedProperty.contactEmail}">${this.selectedProperty.contactEmail}</a>
                        </div>
                      ` : ''}
                      ${this.selectedProperty.website ? html`
                        <div class="contact-row">
                          <strong>Website:</strong>
                          <a href="${this.selectedProperty.website}" target="_blank" rel="noopener">View Listing →</a>
                        </div>
                      ` : ''}
                      ${!this.selectedProperty.broker && !this.selectedProperty.propertyManager &&
                        !this.selectedProperty.contactPhone && !this.selectedProperty.contactEmail &&
                        !this.selectedProperty.website ? html`
                        <div class="contact-row">
                          <em>Contact information not available for this property</em>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </main>
      </div>
    `;
  }
}
