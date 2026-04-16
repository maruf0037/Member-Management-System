import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, logout } from '@/src/firebase';
import { useAuth } from '@/src/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  X,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { name: 'Finances', path: '/admin/finances', icon: BarChart3 },
    { name: 'Public Site', path: '/', icon: Globe },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="bg-sidebar text-white flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 font-extrabold text-white tracking-tight text-lg"
              >
                <img src="/logo.png" alt="Zero Seven Foundation" className="w-8 h-8 object-contain bg-white rounded-[4px] p-0.5 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="w-8 h-8 bg-primary rounded-[4px] shrink-0 hidden" />
                <span className="text-sm">ZERO SEVEN</span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 mx-auto"
              >
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain bg-white rounded-[4px] p-0.5" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="w-full h-full bg-primary rounded-[4px] hidden" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 transition-all group relative",
                  isActive 
                    ? "bg-white/5 text-white border-l-4 border-primary" 
                    : "text-white/70 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "text-primary" : "text-white/50 group-hover:text-white/80")} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className={cn("flex items-center gap-3", isSidebarOpen ? "px-2" : "justify-center")}>
            <Avatar className="w-8 h-8 border border-white/10">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="bg-white/10 text-white/50 text-xs">
                {user.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                <p className="text-xs text-white/50 truncate uppercase tracking-wider">{profile?.role || 'User'}</p>
              </div>
            )}
            {isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <LogOut size={18} />
              </Button>
            )}
          </div>
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="w-full mt-4 text-white/50 hover:text-white hover:bg-white/10"
            >
              <LogOut size={18} />
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-card-border flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-text-muted hover:text-text-main"
            >
              <MenuIcon size={20} />
            </Button>
            <div className="h-4 w-px bg-card-border" />
            <span className="text-sm font-medium text-text-muted">
              {location.pathname.includes('/admin/members') ? 'Member Directory' : 
               location.pathname.includes('/admin/subscriptions') ? 'Subscription Tracking' :
               location.pathname.includes('/admin/finances') ? 'Financial Reports' :
               'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-4">
             {/* Header actions */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
