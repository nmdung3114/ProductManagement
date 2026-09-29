const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5143";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = options.token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    const errorMessage = data.message || data.title || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
