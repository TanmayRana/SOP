import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
// import AdminDashboard from "./pages/AdminDashboard";
// import AdminUpload from "./pages/AdminUpload";
// import AdminDocuments from "./pages/Documents";
import NotFound from "./pages/NotFound";
import DashboardProvider from "./components/pageComponents/DashboardProvider";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";


const adminLinks = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Chat",
    url: "/chat",
    icon: "MessageSquare",
  },
  {
    title: "Documents",
    url: "/documents",
    icon: "FolderOpen",
  },
];

const DashboardLayout = () => (
  <DashboardProvider links={adminLinks}>
    <Outlet />
  </DashboardProvider>
);

const queryClient = new QueryClient();

import AuthInitializer from "./components/auth/AuthInitializer";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthInitializer>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:chatId" element={<Chat />} />

                <Route element={<DashboardLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
