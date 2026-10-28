import axios from 'axios';
import { handleMockRequest } from './mockBackend.js';

// Custom adapter to seamlessly handle requests offline / serverless
const customAdapter = async (config) => {
  const remoteApiUrl = import.meta.env.VITE_API_URL;

  // If a remote HTTP/HTTPS API URL is explicitly configured, attempt network request first
  if (remoteApiUrl && (remoteApiUrl.startsWith('http://') || remoteApiUrl.startsWith('https://'))) {
    try {
      const defaultAdapter = axios.getAdapter('xhr');
      const response = await defaultAdapter(config);

      // Verify the response is not an HTML rewrite fallback from an SPA server
      const contentType = response.headers?.['content-type'] || '';
      const isHtmlResponse =
        typeof response.data === 'string' &&
        (response.data.includes('<!doctype html') || response.data.includes('<html') || contentType.includes('text/html'));

      if (!isHtmlResponse) {
        return response;
      }
      console.warn('[CareSync API] Remote returned HTML fallback, routing to simulated engine...');
    } catch (networkError) {
      console.warn('[CareSync API] Network call to remote API failed, routing to simulated engine:', networkError.message);
    }
  }

  // Handle request via standalone simulated persistence engine (localStorage + seeds)
  const mockRes = await handleMockRequest(config);

  if (mockRes.status >= 200 && mockRes.status < 300) {
    return {
      data: mockRes.data,
      status: mockRes.status,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {},
    };
  }

  // Reject on 4xx/5xx errors in Axios format
  const error = new Error(mockRes.data?.message || `Request failed with status code ${mockRes.status}`);
  error.config = config;
  error.response = {
    data: mockRes.data,
    status: mockRes.status,
    statusText: mockRes.status === 401 ? 'Unauthorized' : mockRes.status === 404 ? 'Not Found' : 'Bad Request',
    headers: { 'content-type': 'application/json' },
    config,
  };
  error.isAxiosError = true;
  throw error;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  adapter: customAdapter,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('caresync_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
    }
    return Promise.reject(error);
  }
);

export default api;
