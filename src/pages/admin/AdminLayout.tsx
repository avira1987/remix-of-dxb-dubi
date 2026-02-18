import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Building2, 
  LogOut, 
  Menu,
  X,
  Home,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
  { icon: Building2, label: 'Brands', path: '/admin/brands' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminLayout = () => {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminLayout.tsx:29',message:'AdminLayout render start',data:{path:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  } catch(e) {}
  // #endregion
  
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  
  // #region agent log
  let authResult;
  try {
    authResult = useAuth();
    fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminLayout.tsx:40',message:'useAuth called',data:{hasUser:!!authResult?.user,loading:authResult?.loading,isAdmin:authResult?.isAdmin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  } catch(error) {
    fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminLayout.tsx:43',message:'useAuth error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    throw error;
  }
  const { user, loading, isAdmin, signOut } = authResult;
  // #endregion

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Update sidebar state when switching between mobile/desktop
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?redirect=/admin');
    } else if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [user, loading, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="font-display text-lg text-foreground">Admin Panel</h2>
          <div className="w-10" />
        </header>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? 280 : (sidebarOpen ? 260 : 72),
          x: isMobile ? (sidebarOpen ? 0 : -280) : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 overflow-hidden",
          isMobile && "shadow-2xl"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            {(sidebarOpen || isMobile) && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-xl text-foreground"
              >
                Admin Panel
              </motion.h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(sidebarOpen || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-body text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-body text-sm"
                >
                  View Store
                </motion.span>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-body text-sm"
                >
                  Sign Out
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 min-w-0',
          isMobile ? 'ml-0 pt-14' : (sidebarOpen ? 'ml-[260px]' : 'ml-[72px]')
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
