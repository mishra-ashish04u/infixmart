const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const imgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${apiUrl}${path}`;
};
