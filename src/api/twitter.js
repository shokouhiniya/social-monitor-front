import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const twitterApi = {
  syncAccount: async (username, pageCategory = 'official', clientKeywords = undefined) => {
    const response = await axios.post(`${API_BASE_URL}/twitter/sync`, { 
      username,
      page_category: pageCategory,
      client_keywords: clientKeywords,
    });
    return response.data;
  },

  monitorAccount: async (pageId) => {
    const response = await axios.post(`${API_BASE_URL}/twitter/monitor/${pageId}`);
    return response.data;
  },

  getProfile: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/profile/${username}`);
    return response.data;
  },

  getTweets: async (username, count = 20) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/tweets/${username}`, {
      params: { count },
    });
    return response.data;
  },

  searchTweets: async (query, count = 20) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/search`, {
      params: { query, count },
    });
    return response.data;
  },

  getTweetDetails: async (tweetId) => {
    const response = await axios.get(`${API_BASE_URL}/twitter/tweet/${tweetId}`);
    return response.data;
  },

  fetchMoreTweets: async (pageId, count = 50) => {
    const response = await axios.post(`${API_BASE_URL}/twitter/fetch-more/${pageId}`, { count });
    return response.data;
  },
};
