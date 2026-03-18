import api from './client';

export const fetchMe = async () => {
  const { data } = await api.get('/api/users/me');
  return data;
};

export const updateMe = async (payload) => {
  const { data } = await api.put('/api/users/me', payload);
  return data;
};
