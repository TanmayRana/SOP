import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { getProfile } from "@/store/slices/auth.slice";
import { authService } from "@/store/services/auth.service";
import { Loader2 } from "lucide-react";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First try to get profile
        await dispatch(getProfile()).unwrap();
      } catch (error: any) {
        // If profile fails due to auth, try refreshing token
        if (
          error.message?.includes("401") ||
          error.message?.includes("Access token required")
        ) {
          try {
            await authService.refreshToken();
            // If refresh succeeds, try profile again
            await dispatch(getProfile()).unwrap();
          } catch (refreshError) {
            // Refresh also failed, user needs to login
            console.log("Session expired, user needs to login");
          }
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <p className="mt-4 text-muted-foreground animate-pulse font-medium">
          Initializing session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
