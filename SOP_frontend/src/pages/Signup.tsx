import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Mail, Lock, ArrowRight, Loader2, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  registerUser,
  resendEmailOtp,
  verifyEmailOtp,
  clearError,
} from "@/store/slices/auth.slice";
import type { RegisterRequest } from "@/store/services/auth.service";
import { useAppDispatch, useAppSelector } from "@/hooks";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";


const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const dialogSessionRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, error, user } = useAppSelector(
    (state) => state.auth,
  );



  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Start countdown when dialog opens
  useEffect(() => {
    if (isOpen && verifyEmail && dialogSessionRef.current !== verifyEmail) {
      dialogSessionRef.current = verifyEmail;
      setCountdown(30);
    } else if (!isOpen) {
      dialogSessionRef.current = null;
      setCountdown(0);
    }
  }, [isOpen, verifyEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const registerData: RegisterRequest = {
        fullname: fullName,
        email,
        password,
      };
      await dispatch(registerUser(registerData)).unwrap();
      toast({
        title: "Account created!",
        description: "OTP sent to your email. Please verify.",
      });
      setVerifyEmail(email);
      setOtp("");
      setCountdown(30); // Start 30 second countdown (matching backend)
      setIsOpen(true);
    } catch (error: any) {
      // Error is handled by useEffect above
    }
  };

  const handleResendOtp = async () => {
    if (!verifyEmail) return;
    try {
      await dispatch(resendEmailOtp({ email: verifyEmail })).unwrap();
      toast({
        title: "OTP sent",
        description: "We sent a new code to your email.",
      });
      setCountdown(30); // Reset countdown to 30 seconds (matching backend)
    } catch (error: any) {
      // Handle cooldown error from backend
      if (error?.remainingCooldown) {
        setCountdown(error.remainingCooldown);
        toast({
          title: "Please wait",
          description: `Please wait ${error.remainingCooldown} seconds before requesting another OTP.`,
          variant: "destructive",
        });
      }
      // Error handled by slice toast effect
    }
  };

  const handleVerifyOtp = async () => {
    if (!verifyEmail) return;
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(verifyEmailOtp({ email: verifyEmail, otp })).unwrap();
      toast({
        title: "Verified",
        description: "Email verified successfully.",
      });
      setIsOpen(false);
      navigate("/dashboard");
    } catch (error: any) {
      // Error is handled by useEffect above
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-lg btn-gradient flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              SOP Agent
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Get started with SOP Agent today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </p>

          {/* Demo Note */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> Use any email with "admin" for admin
              access, otherwise you'll be logged in as an employee.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Your procedures, answered instantly
          </h2>
          <p className="text-muted-foreground">
            Stop searching through documents. Ask questions in plain English and
            get accurate, cited answers from your SOPs.
          </p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Verify your email</CardTitle>
              <CardDescription>
                Enter the verification code we sent to:{" "}
                <span className="font-medium">{verifyEmail || email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <label htmlFor="otp-verification">Verification code</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isLoading || !verifyEmail || countdown > 0}
                    className="h-8 text-primary hover:text-primary/80"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${countdown > 0 ? 'animate-spin' : ''}`} />
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </Button>
                </div>

                <InputOTP
                  maxLength={6}
                  id="otp-verification"
                  value={otp}
                  onChange={setOtp}
                  required
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-2" />
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6 || !verifyEmail}
                >
                  Verify
                </Button>
                <div className="text-muted-foreground text-sm">
                  Having trouble?{" "}
                  <a
                    href="#"
                    className="hover:text-primary underline underline-offset-4 transition-colors"
                  >
                    Contact support
                  </a>
                </div>
              </div>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;

