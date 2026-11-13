import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AnimatedBackground } from './components/AnimatedBackground';
import { WhatsAppButton } from './components/WhatsAppButton';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Skills } from './pages/Skills';
import { Projects } from './pages/Projects';
import { Blog } from './pages/Blog';
import { Learning } from './pages/Learning';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { Hackathons } from './pages/Hackathons';
import { Certificates } from './pages/Certificates';
import { Contact } from './pages/Contact';

import { AdminDashboard } from './admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

// Custom distinctive page transition variants per section
const pageVariants: Record<string, any> = {
  home: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.25 } },
  },
  about: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  },
  skills: {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  },
  projects: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
  },
  blog: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  },
  learning: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  },
  dashboard: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  },
  hackathons: {
    initial: { opacity: 0, x: 25 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -25, transition: { duration: 0.2 } },
  },
  certificates: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
  },
  contact: {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -25, transition: { duration: 0.2 } },
  },
  admin: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  },
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { signOut } = useAuth();

  // Sync hash routing for browser back/forward support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    window.location.hash = pageId === 'home' ? '' : pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    await signOut();
    handleNavigate('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'skills':
        return <Skills onNavigate={handleNavigate} />;
      case 'projects':
        return <Projects />;
      case 'blog':
        return <Blog onNavigate={handleNavigate} />;
      case 'learning':
        return <Learning />;
      case 'dashboard':
        return <DeveloperDashboard />;
      case 'hackathons':
        return <Hackathons />;
      case 'certificates':
        return <Certificates onNavigate={handleNavigate} />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return (
          <ProtectedAdminRoute onNavigateHome={() => handleNavigate('home')}>
            <AdminDashboard onLogout={handleAdminLogout} onNavigate={handleNavigate} />
          </ProtectedAdminRoute>
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const activeVariant = pageVariants[currentPage] || pageVariants.home;

  return (
    <div className="min-h-screen bg-[#030305] text-[#F8FAFC] selection:bg-[#7C5CFC]/30 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* WebGL Cursor-Reactive Fluid Background */}
      <AnimatedBackground />

      {/* Sticky Glass Navbar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content with Animated Presence */}
      <main className="flex-1 w-full pt-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={activeVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Floating WhatsApp Direct Contact */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
