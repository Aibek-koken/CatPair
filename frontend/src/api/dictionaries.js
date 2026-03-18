import api from './client';

export const fetchCities = async () => {
  const { data } = await api.get('/api/dictionaries/cities');
  return data;
};

export const fetchBreeds = async () => {
  const { data } = await api.get('/api/dictionaries/breeds');
  return data;
};
