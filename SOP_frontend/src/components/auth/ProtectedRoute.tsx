import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks";

const ProtectedRoute = () => {
    const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

    if (!isInitialized) {
        // This case is actually handled by AuthInitializer, but good for safety
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
