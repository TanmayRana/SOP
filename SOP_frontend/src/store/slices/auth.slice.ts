import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type RegisterResponse,
  type SendOtpRequest,
  type VerifyOtpRequest,
  type UpdateProfileRequest,
  type UploadAvatarResponse,
} from "@/store/services/auth.service";

interface AuthState {
  user: {
    id: string;
    fullname: string;
    email: string;
    avatar?: string;
    lastLogin?: string;
    isEmailVerified?: boolean;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Login failed");
  }
});

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterRequest,
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Registration failed");
  }
});

export const resendEmailOtp = createAsyncThunk<
  { message: string },
  SendOtpRequest,
  { rejectValue: string }
>("auth/resendEmailOtp", async (data, { rejectWithValue }) => {
  try {
    const response = await authService.sendOtp(data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to send OTP");
  }
});

export const verifyEmailOtp = createAsyncThunk<
  AuthResponse,
  VerifyOtpRequest,
  { rejectValue: string }
>("auth/verifyEmailOtp", async (data, { rejectWithValue }) => {
  try {
    const response = await authService.verifyOtp(data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "OTP verification failed");
  }
});

export const logoutUser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.logout();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Logout failed");
  }
});

export const getProfile = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getProfile();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to get profile");
  }
});

export const updateProfile = createAsyncThunk<
  AuthResponse,
  UpdateProfileRequest,
  { rejectValue: string }
>("auth/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update profile");
  }
});

export const uploadAvatar = createAsyncThunk<
  UploadAvatarResponse,
  File,
  { rejectValue: string }
>("auth/uploadAvatar", async (file, { rejectWithValue }) => {
  try {
    const response = await authService.uploadAvatar(file);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to upload avatar");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.error = null;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
        state.user = null;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<RegisterResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.error = null;
        },
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
        state.isAuthenticated = false;
        state.user = null;
      });

    // Resend OTP
    builder
      .addCase(resendEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendEmailOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send OTP";
      });

    // Verify OTP
    builder
      .addCase(verifyEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        verifyEmailOtp.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.error = null;
        },
      )
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "OTP verification failed";
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload || "Logout failed";
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getProfile.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.error = null;
        },
      )
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload || "Failed to get profile";
        state.isAuthenticated = false;
        state.user = null;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.error = null;
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile";
      });

    // Upload Avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        uploadAvatar.fulfilled,
        (state, action: PayloadAction<UploadAvatarResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.error = null;
        },
      )
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to upload avatar";
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
