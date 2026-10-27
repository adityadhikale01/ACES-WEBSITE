import React from 'react';
import { Hero } from '../components/home/Hero.js';
import { AboutSection } from '../components/home/AboutSection.js';
import { EventsPreview } from '../components/home/EventsPreview.js';
import { TeamPreview } from '../components/home/TeamPreview.js';
import { JoinCta } from '../components/home/JoinCta.js';

export const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <AboutSection />
      <EventsPreview />
      <TeamPreview />
      <JoinCta />
    </main>
  );
};
