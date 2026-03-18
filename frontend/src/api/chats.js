import api from './client';

export const createChat = async (listingId) => {
  const { data } = await api.post('/api/chats', { listingId });
  return data;
};

export const fetchChats = async () => {
  const { data } = await api.get('/api/chats');
  return data;
};

export const fetchMessages = async (chatId) => {
  const { data } = await api.get(`/api/chats/${chatId}/messages`);
  return data;
};

export const sendMessage = async (chatId, text) => {
  const { data } = await api.post(`/api/chats/${chatId}/messages`, { text });
  return data;
};
