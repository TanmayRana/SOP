import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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

const adminLinks = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat/:id" element={<Chat />} />
          {/* <Route path="/upload" element={<AdminUpload />} /> */}

          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
