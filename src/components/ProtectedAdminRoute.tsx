import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminLogin } from '../admin/AdminLogin';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
}

/**
 * Route guard for Admin operations.
 * Enforces:
 * 1. Active Supabase session
 * 2. Database verification in public.admin_users
 * 3. Shows secure loading screen during authorization check to prevent UI leaks
 */
export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  onNavigateHome,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Loading state during session restoration or database verification
  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm glass-panel rounded-2xl p-8 border border-slate-800 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle glowing ambient background */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-purple-500/30 flex items-center justify-center text-[#00D4FF] mx-auto mb-4 relative shadow-lg">
            <Shield className="w-7 h-7 text-[#7C5CFC]" />
            <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin absolute -inset-0.5 m-auto opacity-75" />
          </div>

          <h3 className="text-base font-bold text-white tracking-tight mb-1">
            Verifying Admin Authorization
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Validating identity against Supabase database...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated or not a verified admin in public.admin_users, show AdminLogin
  if (!isAuthenticated || !isAdmin) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          // Handled reactively by AuthContext
        }}
        onCancel={onNavigateHome}
      />
    );
  }

  // Authorized Administrator: render protected content
  return <>{children}</>;
};
