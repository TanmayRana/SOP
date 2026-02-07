export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    avatar?: string;
    lastLogin?: string;
    isEmailVerified?: boolean;
  };
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class AuthService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/auth${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Auth service error:", error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/logout", {
      method: "POST",
    });
  }

  async getProfile(): Promise<AuthResponse> {
    return this.request("/profile", {
      method: "GET",
    });
  }

  async refreshToken(): Promise<{ message: string }> {
    return this.request("/refresh-token", {
      method: "POST",
    });
  }

  async sendOtp(data: SendOtpRequest): Promise<{ message: string }> {
    return this.request("/send-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    return this.request("/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
