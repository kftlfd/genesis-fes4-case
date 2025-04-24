import { env } from './env';

export const api = (url: string, options?: RequestInit) =>
  fetch(`${env.API_URL}/api/${url}`, options);
