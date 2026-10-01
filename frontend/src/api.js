// Picks where the data lives.
//   default (no setup)          -> React only: everything is stored in the browser (api.local.js)
//   VITE_USE_BACKEND=true       -> talks to the Express + MongoDB API (api.server.js)
// Set it in frontend/.env, e.g.  VITE_USE_BACKEND=true
import { api as serverApi, setToken as setServerToken } from './api.server';
import { api as localApi, setToken as setLocalToken } from './api.local';

export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
export const api = USE_BACKEND ? serverApi : localApi;
export const setToken = USE_BACKEND ? setServerToken : setLocalToken;
