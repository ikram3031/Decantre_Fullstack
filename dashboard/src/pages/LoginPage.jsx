import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { DecantreLogo } from '@/components/DecantreLogo';
import { ReCaptcha } from '@/components/ReCaptcha';

const LoginPage = () => {
  const { login, error } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  // const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      const message = 'Please enter both email and password.';
      setLocalError(message);
      addToast({ type: 'error', title: 'Login required', message });
      return;
    }

    // CAPTCHA validation disabled for now.
    // if (!isVerified) {
    //   const message = 'Please verify you are not a robot by completing the reCAPTCHA.';
    //   setLocalError(message);
    //   addToast({ type: 'error', title: 'Verification required', message });
    //   return;
    // }
    
    setIsLoading(true);
    setLocalError(null);
    try {
      await login(email, password);
      addToast({ type: 'success', title: 'Signed in', message: 'Welcome back to Decantre Admin.' });
    } catch (err) {
      const message = err.message || 'Login failed';
      setLocalError(message);
      addToast({ type: 'error', title: 'Authentication failed', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
			<div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

			<motion.div
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-md relative z-10"
			>
				<div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden">
					{/* Header */}
					<div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 bg-slate-50/50">
						<div className="mx-auto h-17 w-17 rounded-full mb-3 flex items-center justify-center bg-black">
							<DecantreLogo
								className="h-16 w-16 rounded-full"
								strokeWidth={3.2}
							/>
						</div>
						<h1 className="text-2xl font-bold tracking-tight font-sans flex items-center justify-center gap-2">
							Decantre Admin
						</h1>
						<p className="text-sm text-slate-500 mt-1.5">
							Secure access to your store administration portal
						</p>
					</div>

					<div className="p-8">
						{/* Alert boxes */}
						{(error || localError) && (
							<div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
								<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
								<div>
									<span className="font-semibold">Authentication failed</span>
									<p className="text-rose-600 mt-0.5">{localError || error}</p>
								</div>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1.5">
									Email Address
								</label>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
										<Mail className="h-4.5 w-4.5" />
									</span>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl text-slate-950 font-sans text-sm outline-none transition duration-150 shadow-xs"
										placeholder="name@example.com"
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-1.5">
									<label className="block text-sm font-medium text-slate-700">
										Password
									</label>
									<a
										href="#"
										className="text-xs font-semibold text-slate-900 hover:underline"
									>
										Forgot password?
									</a>
								</div>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
										<Lock className="h-4.5 w-4.5" />
									</span>
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-950 rounded-xl text-slate-950 font-sans text-sm outline-none transition duration-150 shadow-xs"
										placeholder="••••••••"
									/>
								</div>
							</div>

							{/* Secure reCAPTCHA Challenge */}
							{/*
              <div className="py-1">
                <ReCaptcha verified={isVerified} onVerify={setIsVerified} />
              </div>
              */}

							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl font-semibold text-sm transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-slate-950/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<>
										<LogIn className="h-4 w-4" />
										Sign In
									</>
								)}
							</button>
						</form>

						{/* Quick Demo Credentials */}
						<div className="mt-8 pt-6 border-t border-slate-100">
							<div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
								<span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
									Demo Credentials
								</span>
								<div className="space-y-1.5 text-xs text-slate-600">
									<div className="flex justify-between">
										<span>Email:</span>
										<code className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-800">
											admin@example.com
										</code>
									</div>
									<div className="flex justify-between">
										<span>Password:</span>
										<code className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-800">
											admin
										</code>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;