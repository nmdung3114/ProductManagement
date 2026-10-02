const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5143";

interface FetchOptions extends RequestInit {
  token?: string;
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

function clearSessionAndRedirect() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }
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
    // Nếu gặp lỗi 401 và không phải là request trong nhóm /api/auth/, và chưa retry
    const isAuthEndpoint = endpoint.startsWith("/api/auth/");
    if (response.status === 401 && !isAuthEndpoint && !options._retry) {
      const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

      if (!storedRefreshToken) {
        clearSessionAndRedirect();
        throw new Error(data.message || "Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
      }

      if (isRefreshing) {
        // Nếu đang có tiến trình refresh chạy, xếp hàng đợi token mới
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          return apiFetch<T>(endpoint, {
            ...options,
            token: newToken,
            _retry: true,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        const refreshData = await refreshResponse.json().catch(() => ({}));

        if (!refreshResponse.ok || !refreshData.token) {
          throw new Error(refreshData.message || "Làm mới phiên đăng nhập thất bại.");
        }

        const newAccessToken = refreshData.token;
        const newRefreshToken = refreshData.refreshToken;

        if (typeof window !== "undefined") {
          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          window.dispatchEvent(
            new CustomEvent("token-refreshed", { detail: { token: newAccessToken } })
          );
        }

        processQueue(null, newAccessToken);

        // Gửi lại request ban đầu với token mới
        return apiFetch<T>(endpoint, {
          ...options,
          token: newAccessToken,
          _retry: true,
        });
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearSessionAndRedirect();
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    if (response.status === 401 && typeof window !== "undefined") {
      clearSessionAndRedirect();
    }

    const errorMessage = data.message || data.title || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
