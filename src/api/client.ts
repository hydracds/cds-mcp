import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { decrypt } from "../utils/crypto.js";

const API_BASE_URL = "https://cardexscan.com/api";
const API_KEY = "7c6095cf2eeeac500667241439ab5c3eac2488b9962526ca7f543d76b56a7c";

const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export async function apiGet<T = any>(
  path: string,
  params?: Record<string, any>,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const config: AxiosRequestConfig = { params };
  if (extraHeaders) {
    config.headers = extraHeaders;
  }
  const response = await httpClient.get(path, config);
  return response.data;
}

export async function apiPost<T = any>(
  path: string,
  body: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const config: AxiosRequestConfig = {};
  if (extraHeaders) {
    config.headers = extraHeaders;
  }
  const response = await httpClient.post(path, body, config);
  return response.data;
}

export function decryptField(data: any, field: string): any {
  if (data && data[field]) {
    return decrypt(data[field]);
  }
  return null;
}

export { API_KEY };
