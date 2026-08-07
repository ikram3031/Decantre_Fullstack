'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/core/auth-context';
import { Button } from '@/components/core/ui/button';
import { Input } from '@/components/core/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/core/ui/card';
import { handleGlobalError } from '@/lib/core/error-handler';
import { toast } from 'sonner';

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { user, login, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Detect and process Google Auth redirect code
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Need to set signing in state client-side when Google OAuth code is detected in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        setIsGoogleSigningIn(true);
        const redirectUri = window.location.origin + '/login';
        loginWithGoogle(code, redirectUri)
          .then(() => {
            toast.success('Logged in with Google successfully.');
          })
          .catch((err: unknown) => {
            handleGlobalError(err);
            setIsGoogleSigningIn(false);
            router.replace('/login');
          });
      }
    }
  }, [loginWithGoogle, router]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    // Captcha verification removed – login proceeds directly

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully.');
      // Redirect is handled by auth state effect once user is set.
    } catch (err: unknown) {
      handleGlobalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id-here';
    const redirectUri = window.location.origin + '/login';
    const scope = 'openid email profile';
    const responseType = 'code';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  };

  if (isAuthLoading || isGoogleSigningIn) {
    return (
      <div className="dark h-screen w-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 border-3 border-border border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-medium font-sans">
          {isGoogleSigningIn ? 'Signing in with Google...' : 'Booting secure session...'}
        </span>
      </div>
    );
  }

  return (
    <div className="dark h-screen w-screen max-h-screen bg-background text-foreground flex items-center justify-center p-3 relative overflow-hidden font-sans selection:bg-indigo-500/35 selection:text-foreground">
      {/* Ambient Gradient Glows to make the login card stand out */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-70 animate-pulse [animation-duration:8s]" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none opacity-40 animate-pulse [animation-duration:12s]" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none opacity-45 animate-pulse [animation-duration:10s]" />

      {/* Dark Grid Background using Theme Variables */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px] relative z-10 my-auto"
      >
        {/* Compact Card Container mapped to Theme OKLCH Variables */}
        <Card className="shadow-2xl border-border bg-card/90 text-card-foreground backdrop-blur-xl overflow-hidden rounded-2xl">
          {/* Header - Compact */}
          <CardHeader className="px-5 pt-5 pb-3 text-center border-b border-border/80 bg-card/40">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center justify-center gap-1.5 text-foreground">
              DASHBOARD LOGIN
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
              Secure store administration portal
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3.5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background/60 border-border text-foreground focus:border-primary placeholder:text-muted-foreground/40 rounded-lg"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Password
                  </label>
                  <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background/60 border-border text-foreground focus:border-primary placeholder:text-muted-foreground/40 rounded-lg"
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
                className="w-full mt-3 h-9 flex items-center justify-center font-semibold text-xs bg-foreground hover:bg-foreground/90 text-background transition cursor-pointer shadow-md rounded-lg"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                )}
                {isSubmitting ? 'Signing In…' : 'Log In'}
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-semibold">Or continue with</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-9 flex items-center justify-center font-semibold text-xs border-border bg-background/40 hover:bg-background/80 hover:text-white transition cursor-pointer shadow-sm rounded-lg"
              >
                <GoogleIcon />
                Google Account
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
