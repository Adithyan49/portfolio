import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyAdminStatus: (userId: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Prevent multiple concurrent verification checks
  const isVerifyingRef = useRef<boolean>(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  /**
   * Queries public.admin_users for user_id === authenticated user's ID.
   * Fails closed (returns false) if database check fails or user is not listed.
   */
  const verifyAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    if (!userId || !isSupabaseConfigured) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Supabase admin_users verification error:', error.message);
        return false;
      }

      return Boolean(data && data.user_id === userId);
    } catch (err: any) {
      console.error('Exception during admin role verification:', err);
      return false;
    }
  }, []);

  /**
   * Complete sign-in with email & password, followed by strict database role verification.
   */
  const signInWithEmail = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    clearAuthError();
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.');
      }

      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error('Please enter both your administrator email and password.');
      }

      // Step 1: Supabase Authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Authentication succeeded, but no user profile was returned.');
      }

      // Step 2: Strict Database Role Verification against public.admin_users
      const isVerifiedAdmin = await verifyAdminStatus(data.user.id);

      if (!isVerifiedAdmin) {
        // Authenticated in Supabase Auth, but NOT an authorized administrator in public.admin_users
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsAdmin(false);

        const unauthorizedMsg =
          'Access Denied: Your account is authenticated in Supabase, but is not registered in the public.admin_users table. Access to the Admin Console is restricted to verified administrators.';
        setAuthError(unauthorizedMsg);
        return { success: false, error: unauthorizedMsg };
      }

      // Step 3: Verified Administrator Access Granted
      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      setAuthError(null);

      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || 'Authentication failed. Please verify your administrator credentials.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthError, verifyAdminStatus]);

  /**
   * Secure sign-out: terminates Supabase session, resets admin authorization state.
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAuthError(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Password reset via Supabase Authentication.
   * Dispatches reset email with properly configured redirect URL.
   */
  const resetPasswordForEmail = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase client is not configured.');
      }

      const cleanEmail = email.trim();
      if (!cleanEmail) {
        throw new Error('Please enter a valid email address.');
      }

      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${currentOrigin}/#admin`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        // Provide clear guidance if redirect URL isn't configured in Supabase
        if (error.message.toLowerCase().includes('redirect') || error.message.toLowerCase().includes('url')) {
          return {
            success: false,
            error: `Password reset request failed: Supabase redirect URL error (${error.message}). Please ensure "${currentOrigin}/**" is allowed in your Supabase Project Settings -> Authentication -> URL Configuration -> Redirect URLs.`,
          };
        }
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: `A password reset link has been dispatched to ${cleanEmail} by Supabase. Please follow the instructions in the email to set a new password.`,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to dispatch password reset email.' };
    }
  }, []);

  /**
   * Re-verify session on request.
   */
  const refreshSession = useCallback(async () => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user || sessionData.session.user;

      if (!currentUser) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        return;
      }

      const isVerified = await verifyAdminStatus(currentUser.id);
      if (isVerified) {
        setUser(currentUser);
        setSession(sessionData.session);
        setIsAdmin(true);
      } else {
        // Authenticated but not an admin in public.admin_users
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      isVerifyingRef.current = false;
      setIsLoading(false);
    }
  }, [verifyAdminStatus]);

  // Initial session restoration and auth listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Initial session lookup note:', sessionError.message);
        }

        if (isMounted && sessionData?.session?.user) {
          const currentUser = sessionData.session.user;
          const isVerified = await verifyAdminStatus(currentUser.id);

          if (isMounted) {
            if (isVerified) {
              setUser(currentUser);
              setSession(sessionData.session);
              setIsAdmin(true);
            } else {
              // Fail closed: not in admin_users
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              setIsAdmin(false);
            }
          }
        } else if (isMounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state transitions safely
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Run database check outside sync callback to avoid Supabase client deadlocks
        setTimeout(async () => {
          if (!isMounted) return;

          if (newSession?.user) {
            const isVerified = await verifyAdminStatus(newSession.user.id);
            if (isMounted) {
              if (isVerified) {
                setUser(newSession.user);
                setSession(newSession);
                setIsAdmin(true);
              } else {
                await supabase.auth.signOut();
                setUser(null);
                setSession(null);
                setIsAdmin(false);
                setAuthError(
                  'Access Denied: Authenticated account is not registered in public.admin_users.'
                );
              }
            }
          } else if (isMounted) {
            setUser(null);
            setSession(null);
            setIsAdmin(false);
          }
        }, 0);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAdminStatus]);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: Boolean(user && session),
    isAdmin,
    isLoading,
    authError,
    clearAuthError,
    signInWithEmail,
    signOut,
    resetPasswordForEmail,
    verifyAdminStatus,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
