import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';

// Public Pages
import { HomePage } from './pages/HomePage.js';
import { AboutPage } from './pages/AboutPage.js';
import { EventsPage } from './pages/EventsPage.js';
import { EventDetailPage } from './pages/EventDetailPage.js';
import { TeamPage } from './pages/TeamPage.js';
import { ActivitiesPage } from './pages/ActivitiesPage.js';
import { AchievementsPage } from './pages/AchievementsPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { JoinPage } from './pages/JoinPage.js';
import { ContactPage } from './pages/ContactPage.js';

// Auth Pages
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

// Dashboard Pages
import { MemberDashboard } from './pages/MemberDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-navy-900 text-slate-100 selection:bg-electric-blue selection:text-white">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Member & Admin Dashboards */}
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <div className="pt-40 pb-28 text-center max-w-md mx-auto px-4">
                <h2 className="text-3xl font-extrabold text-white mb-2">404 — Page Not Found</h2>
                <p className="text-xs text-slate-400 mb-6">
                  The page you are looking for does not exist or has been relocated.
                </p>
                <a
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-semibold"
                >
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};
