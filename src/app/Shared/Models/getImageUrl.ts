import { apiUrl } from "../Env/env";

 export function getFullImageUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiUrl}${path}`;
  }