import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CinematicIntro } from '../../components/home/CinematicIntro.jsx';
import { Hero } from '../../components/home/Hero.jsx';
import { AboutSection } from '../../components/home/AboutSection.jsx';
import { EventsPreview } from '../../components/home/EventsPreview.jsx';
import { TeamPreview } from '../../components/home/TeamPreview.jsx';
import { JoinCta } from '../../components/home/JoinCta.jsx';

export const HomePage = () => {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro in the current browser session
    const hasSeenIntro = sessionStorage.getItem('aces_intro_seen');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('aces_intro_seen', 'true');
    setShowIntro(false);
  };

  return (
    <main className="min-h-screen">
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>
      <Hero />
      <AboutSection />
      <EventsPreview />
      <TeamPreview />
      <JoinCta />
    </main>
  );
};

export default HomePage;
