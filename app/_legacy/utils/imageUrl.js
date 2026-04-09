const apiUrl =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const imgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return apiUrl ? `${apiUrl}${path}` : path;
};
