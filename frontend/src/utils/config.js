// Configuration for API endpoints and socket connections
// This is used to make the app work correctly on localhost and other devices

// Get hostname dynamically from browser
const hostname = window.location.hostname;

// For development, use port 4000 for backend
const apiPort = 4000;
const apiUrl = `http://${hostname}:${apiPort}`;

// Socket configuration
const socketUrl = `http://${hostname}:${apiPort}`;
const socketOptions = {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: true,
};

export default {
  API_URL: apiUrl,
  SOCKET_URL: socketUrl,
  SOCKET_OPTIONS: socketOptions,

  // Helper methods
  getApiUrl: (path) => `${apiUrl}${path}`,
  isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
};
