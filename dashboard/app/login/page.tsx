'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DecantreLogo } from '@/components/DecantreLogo';
import { ReCaptcha } from '@/components/ReCaptcha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { handleGlobalError } from '@/lib/error-handler';
import { toast } from '@/components/ui/toast';

export default function LoginPage() {
  const { user, login, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.add({ title: 'Please enter both email and password.', type: 'error', timeout: 4000 });
      return;
    }

    // Captcha verification removed – login proceeds directly

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@example.com');
    setPassword('admin');
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-300">
        <div className="h-8 w-8 border-3 border-slate-800 border-t-slate-200 rounded-full animate-spin" />
        <span className="text-xs font-medium font-sans">Booting secure session...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen max-h-screen bg-slate-950 flex items-center justify-center p-3 selection:bg-slate-800 selection:text-white relative overflow-hidden font-sans">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px] relative z-10 my-auto"
      >
        {/* Compact Gray Card Container */}
        <Card className="shadow-2xl border-slate-800 bg-slate-900/90 text-slate-100 backdrop-blur-xl overflow-hidden rounded-2xl">
          {/* Header - Compact */}
          <CardHeader className="px-5 pt-5 pb-3 text-center border-b border-slate-800/80 bg-slate-900/40">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center justify-center gap-1.5 text-white">
              DASHBOARD LOGIN
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-400 mt-0.5">
              Secure store administration portal
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3.5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-950/60 border-slate-800 text-slate-100 focus:border-slate-400 placeholder:text-slate-600 rounded-lg"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-950/60 border-slate-800 text-slate-100 focus:border-slate-400 placeholder:text-slate-600 rounded-lg"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Secure reCAPTCHA */}
              {/* <div className="py-0.5">
                <ReCaptcha verified={isVerified} onVerify={setIsVerified} />
              </div> */}

              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="w-full mt-3 h-9 flex items-center justify-center font-semibold text-xs bg-slate-100 hover:bg-white text-slate-950 transition cursor-pointer shadow-md rounded-lg"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                )}
                {isSubmitting ? 'Signing In…' : 'Log In'}
              </Button>
            </form>
          </CardContent>

          {/* Compact Quick Demo Footer */}
          {/* <CardFooter className="bg-slate-950/60 p-3 px-4 sm:px-5 border-t border-slate-800/80 flex flex-col gap-1.5 items-stretch">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-300">Demo Access Credentials</span>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-slate-700 text-slate-300 cursor-pointer hover:bg-slate-800 hover:text-white"
                onClick={handleDemoFill}
              >
                Auto Fill
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-[9px] text-slate-500 block font-semibold">EMAIL</span>
                <code className="text-slate-200 font-mono text-[10px]">admin@example.com</code>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-semibold">PASSWORD</span>
                <code className="text-slate-200 font-mono text-[10px]">admin</code>
              </div>
            </div>
          </CardFooter> */}
        </Card>
      </motion.div>
    </div>
  );
}
