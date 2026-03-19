import axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const apiOrigin = (() => {
  try {
    return new URL(baseURL).origin;
  } catch {
    return baseURL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }
})();

export function resolveAssetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (/^data:/i.test(path)) return path;
  // Trim leading slashes and ensure single separator
  const cleanPath = path.replace(/^\/+/, "");
  return `${apiOrigin}/${cleanPath}`;
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
