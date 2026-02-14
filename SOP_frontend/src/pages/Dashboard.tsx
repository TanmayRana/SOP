import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  LayoutDashboard,
  FolderOpen,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DashboardProvider from "@/components/pageComponents/DashboardProvider";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalDocuments: string;
      questionsAnswered: string;
      avgResponseTime: string;
      accuracyRate: string;
    };
    recentDocuments: Array<{
      name: string;
      status: string;
      uploadedAt: string;
    }>;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
          withCredentials: true
        });
        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData?.stats.totalDocuments || "0",
      icon: FileText,
      trend: "Total in library",
    },
    {
      label: "Questions Answered",
      value: dashboardData?.stats.questionsAnswered || "0",
      icon: MessageSquare,
      trend: "Across all chats",
    },
    {
      label: "Avg Response Time",
      value: dashboardData?.stats.avgResponseTime || "1.2s",
      icon: Clock,
      trend: "System average",
    },
    {
      label: "Accuracy Rate",
      value: dashboardData?.stats.accuracyRate || "98.5%",
      icon: TrendingUp,
      trend: "Model confidence",
    },
  ];

  const recentDocuments = dashboardData?.recentDocuments || [];

  const handleLogout = () => {
    navigate("/");
  };

  const chatId = uuidv4();
  console.log("chatId=", chatId);

  return (
    // <DashboardProvider links={adminLinks}>
    <main className=" px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your SOP documents and monitor usage
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={`/chat/${chatId}`}>
            <Button className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Create SOP
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-accent mt-1">{stat.trend}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Documents</h2>
          <Link to="/admin/documents">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentDocuments.map((doc) => (
            <div
              key={doc.name}
              className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${doc.status === "ready"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
                  }`}
              >
                {doc.status === "ready" ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {doc.status === "ready" ? "Ready" : "Processing"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
    // </DashboardProvider>
  );
};

export default Dashboard;
