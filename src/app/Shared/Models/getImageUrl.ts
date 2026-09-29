import { apiUrl } from '../Env/env';

export function getFullImageUrl(path: string): string {
  if (!path) return '';

  if (path.startsWith('http')) {
    return path;
  }

  const normalizedBase = apiUrl.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');

  return `${normalizedBase}/${normalizedPath}`;
}