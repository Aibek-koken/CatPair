export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatPrice(type, value) {
  if (!type) return 'Цена по запросу';
  if (type === 'NEGOTIABLE') return 'Договорная';
  if (type === 'FIXED' && value != null) return `${value} ₸`;
  return 'Цена по запросу';
}
