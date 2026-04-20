import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const twitterApi = {
  // Sync a Twitter account by username
  syncAccount: async (username, pageCategory = 'official', clientKeywords = undefined) => {
    const response = await axios.post(`${API_BASE_URL}/twitter/sync`, { 
      username,
      page_category: pageCategory,
      client_keywords: clientKeywords,
    });
    return response.data;
  },

  // Monitor an existing page (refresh data)
  monitorAccount: async (pageId) => {
    const response = await axios.post(`${API_BASE_URL}/twitter/monitor/${pageId}`);
    return response.data;
  },

  // Get Twitter profile information
  getProfile: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/profile/${username}`);
    return response.data;
  },

  // Get user tweets
  getTweets: async (username, count = 20) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/tweets/${username}`, {
      params: { count },
    });
    return response.data;
  },

  // Search tweets
  searchTweets: async (query, count = 20) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/search`, {
      params: { query, count },
    });
    return response.data;
  },

  // Get tweet details
  getTweetDetails: async (tweetId) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/tweet/${tweetId}`);
    return response.data;
  },

  // Fetch more tweets for an existing page
  fetchMoreTweets: async (pageId, count = 50) => {
    const response = await axios.post(`${API_BASE_URL}/twitter/fetch-more/${pageId}`, { count });
    return response.data;
  },
};
