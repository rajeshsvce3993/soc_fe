import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { authApi } from "@/lib/api";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "password">("email");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryClient = useQueryClient();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(username, password);
    if (success) {
      await queryClient.invalidateQueries();
      toast({
        title: "Access Granted",
        description: "Redirecting to AuriSIEM Dashboard...",
      });
      setLocation("/");
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials. Please try again.",
      });
    }
    setIsLoading(false);
  };

  const resetForgotState = () => {
    setForgotStep("email");
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setIsResetLoading(false);
  };

  const handleOpenForgot = () => {
    setResetEmail(username);
    setForgotStep("email");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setIsForgotOpen(true);
  };

  const handleForgotOpenChange = (open: boolean) => {
    setIsForgotOpen(open);
    if (!open) {
      resetForgotState();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetLoading(true);
    try {
      await authApi.sendOtp(resetEmail);
      toast({
        title: "OTP sent",
        description: `We have sent a 6-digit OTP to ${resetEmail}.`,
      });
      setForgotStep("otp");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unable to send OTP",
        description: error?.message || "Please try again later.",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp) return;

    setIsResetLoading(true);
    try {
      await authApi.verifyOtp(resetEmail, resetOtp);
      toast({
        title: "OTP verified",
        description: "Please enter your new password.",
      });
      setForgotStep("password");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: error?.message || "Please check the code and try again.",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter and confirm your new password.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Make sure both password fields are identical.",
      });
      return;
    }

    setIsResetLoading(true);
    try {
      await authApi.updatePassword(resetEmail, newPassword);
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      setUsername(resetEmail);
      setPassword(newPassword);
      setIsForgotOpen(false);
      resetForgotState();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unable to update password",
        description: error?.message || "Please try again later.",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[440px] z-10 space-y-8">
        <Card className="border-zinc-800/50 bg-[#0d1425]/80 backdrop-blur-2xl shadow-2xl rounded-2xl p-4">
          <CardContent className="pt-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  AuriSIEM
                </h1>
                <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                  Optimum Security
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-semibold text-zinc-400 ml-1">
                    Email Address
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="analyst@aurisiem.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 bg-[#161e31] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-500/50 rounded-xl transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-xs font-semibold text-zinc-400">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-[#161e31] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-500/50 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-zinc-700 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" />
                  <label htmlFor="remember" className="text-xs font-medium text-zinc-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleOpenForgot}
                  className="text-xs font-medium text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>

              {/* Sign up prompt hidden as requested */}
            </form>

            <Dialog open={isForgotOpen} onOpenChange={handleForgotOpenChange}>
              <DialogContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
                <DialogHeader>
                  <DialogTitle>Reset password</DialogTitle>
                  {forgotStep === "email" && (
                    <DialogDescription>
                      Enter your email address and we will send a 6-digit OTP to verify your identity.
                    </DialogDescription>
                  )}
                  {forgotStep === "otp" && (
                    <DialogDescription>
                      Enter the 6-digit OTP we sent to your email.
                    </DialogDescription>
                  )}
                  {forgotStep === "password" && (
                    <DialogDescription>
                      OTP verified. Set a new password for your account.
                    </DialogDescription>
                  )}
                </DialogHeader>
                {forgotStep === "email" && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="reset-email"
                        className="text-xs font-semibold text-zinc-400 ml-1"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="analyst@aurisiem.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="h-11 bg-[#0a0f1e] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-500/50 rounded-xl transition-all"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-zinc-700 text-zinc-300"
                        onClick={() => setIsForgotOpen(false)}
                        disabled={isResetLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white"
                        disabled={isResetLoading}
                      >
                        {isResetLoading ? "Sending..." : "Send OTP"}
                      </Button>
                    </div>
                  </form>
                )}

                {forgotStep === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="reset-otp"
                        className="text-xs font-semibold text-zinc-400 ml-1"
                      >
                        OTP
                      </Label>
                      <Input
                        id="reset-otp"
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        className="h-11 bg-[#0a0f1e] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-500/50 rounded-xl transition-all tracking-[0.5em] text-center"
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        className="text-[11px] text-cyan-400 hover:text-cyan-300"
                        onClick={() => setForgotStep("email")}
                        disabled={isResetLoading}
                      >
                        Change email
                      </button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-zinc-700 text-zinc-300"
                          onClick={() => setIsForgotOpen(false)}
                          disabled={isResetLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-cyan-600 hover:bg-cyan-500 text-white"
                          disabled={isResetLoading}
                        >
                          {isResetLoading ? "Verifying..." : "Verify OTP"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {forgotStep === "password" && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-password"
                        className="text-xs font-semibold text-zinc-400 ml-1"
                      >
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 bg-[#0a0f1e] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-500/50 rounded-xl transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-xs font-semibold text-zinc-400 ml-1"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 bg-[#0a0f1e] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-500/50 rounded-xl transition-all"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-zinc-700 text-zinc-300"
                        onClick={() => setIsForgotOpen(false)}
                        disabled={isResetLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white"
                        disabled={isResetLoading}
                      >
                        {isResetLoading ? "Updating..." : "Update password"}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-[10px] text-zinc-600 font-medium">
            AuriSIEM v2.4.1 | Powered by Advanced AI Analytics
          </p>
        </div>
      </div>
    </div>
  );
}
