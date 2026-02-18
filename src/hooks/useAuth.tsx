import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    } finally {
      setRoleLoading(false);
      setAdminChecked(true);
    }
  };

  useEffect(() => {
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:48',message:'AuthProvider useEffect start',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    
    let subscription;
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          // #region agent log
          try {
            fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:55',message:'auth state change',data:{event,hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          } catch(e) {}
          // #endregion
          
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Prevent a redirect race: mark role check as pending BEFORE bootstrapping ends.
            setRoleLoading(true);
            setAdminChecked(false);

            // Defer to avoid deadlocks.
            setTimeout(() => {
              checkAdminRole(session.user.id);
            }, 0);
          } else {
            setIsAdmin(false);
            setRoleLoading(false);
            setAdminChecked(true);
          }

          setBootstrapping(false);
        }
      );
      subscription = sub;
    } catch(error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:80',message:'onAuthStateChange error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }

    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:85',message:'calling getSession',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      // #region agent log
      try {
        fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:90',message:'getSession result',data:{hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      } catch(e) {}
      // #endregion
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setRoleLoading(true);
        setAdminChecked(false);
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
        setRoleLoading(false);
        setAdminChecked(true);
      }

      setBootstrapping(false);
    }).catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:105',message:'getSession error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('getSession error:', error);
      setBootstrapping(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const loading = bootstrapping || roleLoading || (user ? !adminChecked : false);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
