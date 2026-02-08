import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Icon/Illustration */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto rotate-6 border border-border/50">
            <AlertCircle className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            404
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Oops! Page not found
          </h1>
          <p className="text-lg text-muted-foreground">
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild variant="default" size="lg" className="h-12 px-8 min-w-[200px] shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Return to Home
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="h-12 px-8 min-w-[200px] hover:bg-secondary/50">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Lost? Check out our <Link to="/docs" className="text-primary hover:underline">documentation</Link> or <Link to="/support" className="text-primary hover:underline">contact support</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
