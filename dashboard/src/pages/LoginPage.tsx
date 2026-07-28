import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "motion/react";
import { LoginForm } from "../components/login-form";

export const LoginPage: React.FC = () => {
  const { login, error } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      const message = "Please enter both email and password.";
      setLocalError(message);
      addToast({ type: "error", title: "Login required", message });
      return;
    }

    setIsLoading(true);
    setLocalError(null);
    try {
      await login(email, password);
      addToast({
        type: "success",
        title: "Signed in",
        message: "Welcome back to Decantre Admin.",
      });
    } catch (err: any) {
      const message = err.message || "Login failed";
      setLocalError(message);
      addToast({ type: "error", title: "Authentication failed", message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loginEmail = "ikramul.web@gmail.com";
    const loginPassword = "111223344";
    setEmail(loginEmail);
    setPassword(loginPassword);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <LoginForm
          className="w-full"
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={localError || error}
        />
      </motion.div>
    </div>
  );
};

export default LoginPage;
