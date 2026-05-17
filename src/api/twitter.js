import axiosInstance from 'src/lib/axios';

export const twitterApi = {
  syncAccount: async (username, pageCategory = 'official', clientKeywords = undefined) => {
    const response = await axiosInstance.post('/twitter/sync', {
      username,
      page_category: pageCategory,
      client_keywords: clientKeywords,
    });
    return response.data;
  },

  monitorAccount: async (pageId) => {
    const response = await axiosInstance.post(`/twitter/monitor/${pageId}`);
    return response.data;
  },

  getProfile: async (username) => {
    const response = await axiosInstance.get(`/twitter/profile/${username}`);
    return response.data;
  },

  getTweets: async (username, count = 20) => {
    const response = await axiosInstance.get(`/twitter/tweets/${username}`, {
      params: { count },
    });
    return response.data;
  },

  searchTweets: async (query, count = 20) => {
    const response = await axiosInstance.get('/twitter/search', {
      params: { query, count },
    });
    return response.data;
  },

  getTweetDetails: async (tweetId) => {
    const response = await axiosInstance.get(`/twitter/tweet/${tweetId}`);
    return response.data;
  },

  fetchMoreTweets: async (pageId, count = 50) => {
    const response = await axiosInstance.post(`/twitter/fetch-more/${pageId}`, { count });
    return response.data?.data || response.data;
  },
};
