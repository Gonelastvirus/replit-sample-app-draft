import { useApp } from "@/context/AppContext";

const domain = process.env.EXPO_PUBLIC_DOMAIN;
const isLocal = domain ? /^(localhost|\d+\.\d+)/.test(domain) : false;
const protocol = isLocal ? "http" : "https";
const BASE_URL = domain ? `${protocol}://${domain}/api` : "/api";

export function useApi() {
  const { token } = useApp();

  const request = async (method: string, path: string, body?: unknown) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || "Request failed");
    }
    if (res.status === 204) return null;
    return res.json();
  };

  return {
    get: (path: string) => request("GET", path),
    post: (path: string, body: unknown) => request("POST", path, body),
    put: (path: string, body: unknown) => request("PUT", path, body),
    del: (path: string) => request("DELETE", path),
  };
}

export { BASE_URL };
