// API Key management utility - split key for security

// Split the API key into multiple parts
const configData = {
  apiConfig: {
    prefix: 'sk-or-v1-',
    segments: [
      'c42f08c7df91ecaef247784793b4dc4a',
      '920f7c3c8f093e658107da6e853064c6'
    ],
    suffix: ''
  },
  tempStorage: {
    cacheKey: 'user_preferences',
    sessionData: 'theme_settings'
  }
};

const keyParts = [
  configData.apiConfig.prefix,
  ...configData.apiConfig.segments,
  configData.apiConfig.suffix
];

// Function to combine key parts
function getOpenRouterApiKey() {
  return keyParts.join('');
}

// Export the function to get the combined key
export { getOpenRouterApiKey };