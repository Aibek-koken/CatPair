export function getErrorMessage(error, fallback = 'Произошла ошибка') {
  if (!error) return fallback;
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return error.message || fallback;
}
