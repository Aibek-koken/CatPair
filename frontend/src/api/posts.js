import api from './client';

export const fetchFeed = async (page = 0, size = 20) => {
  const { data } = await api.get('/api/posts', { params: { page, size } });
  return data;
};

export const createPost = async (payload) => {
  const { data } = await api.post('/api/posts', payload);
  return data;
};

export const fetchUserPosts = async (userId, page = 0, size = 20) => {
  const { data } = await api.get(`/api/users/${userId}/posts`, { params: { page, size } });
  return data;
};
