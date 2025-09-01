// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:3001'
  },
  production: {
    apiUrl: 'https://mutual-fund-comparator-backend.onrender.com/' // Update this with your actual Render URL
  }
}

// Get current environment
const env = import.meta.env.MODE || 'development'

// Export the appropriate configuration
export const apiConfig = config[env]

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${apiConfig.apiUrl}${endpoint}`
} 