import React, { useEffect } from 'react';
import { signInWithGoogle } from '@/src/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/src/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success('Logged in successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to login');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg p-2 relative">
            <img src="/logo.png" alt="Zero Seven Foundation" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <div className="absolute inset-0 bg-primary rounded-xl flex items-center justify-center text-white hidden">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-sidebar tracking-tight text-center">Zero Seven Foundation</h1>
          <p className="text-text-muted">Secure access to the system</p>
        </div>

        <Card className="bg-white border border-card-border rounded-lg shadow-none overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-sidebar">Welcome Back</CardTitle>
            <CardDescription className="text-text-muted">Please sign in to your account to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <Button 
              onClick={handleLogin}
              className="w-full h-12 bg-white text-text-main border border-card-border hover:bg-slate-50 gap-3 font-bold shadow-none transition-all"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              Sign in with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-card-border"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-white px-3 text-text-muted">Authorized Personnel Only</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-text-muted leading-relaxed px-4 uppercase tracking-wider">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
