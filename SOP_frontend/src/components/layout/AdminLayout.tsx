import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/pageComponents/AppSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
