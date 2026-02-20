import { authService } from "@/store/services/auth.service";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add subscribers to refresh queue
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers
const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Enhanced fetch with automatic token refresh
export const fetchWithRefresh = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const config: RequestInit = {
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // If we get a 401, try to refresh the token
    if (response.status === 401 && !url.includes("/refresh-token")) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await authService.refreshToken();
          isRefreshing = false;

          // Notify all waiting requests
          notifyRefreshSubscribers("refreshed");

          // Retry the original request
          return fetch(url, config);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];

          // Refresh failed, user needs to login
          throw new Error("Session expired");
        }
      } else {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(() => {
            fetch(url, config).then(resolve).catch(reject);
          });
        });
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// Helper function for DELETE requests
export const deleteWithRefresh = async (url: string): Promise<Response> => {
  return fetchWithRefresh(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
