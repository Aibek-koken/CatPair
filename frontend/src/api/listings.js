import api from './client';

export const fetchListings = async (params) => {
  const { data } = await api.get('/api/listings', { params });
  return data;
};

export const fetchListing = async (id) => {
  const { data } = await api.get(`/api/listings/${id}`);
  return data;
};

export const createListing = async (formData) => {
  const { data } = await api.post('/api/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateListing = async (id, payload) => {
  const { data } = await api.put(`/api/listings/${id}`, payload);
  return data;
};

export const updateListingStatus = async (id, status) => {
  const { data } = await api.patch(`/api/listings/${id}/status`, { status });
  return data;
};

export const fetchUserListings = async (userId) => {
  const { data } = await api.get(`/api/users/${userId}/listings`);
  return data;
};
