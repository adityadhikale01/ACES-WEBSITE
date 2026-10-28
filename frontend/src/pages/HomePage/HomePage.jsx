import React from 'react';
import { useLoaderData } from 'react-router-dom';
import Hero from '../../components/home/Hero.jsx';
import Pillars from '../../components/home/Pillars.jsx';
import EventsPreview from '../../components/home/EventsPreview.jsx';
import TeamPreview from '../../components/home/TeamPreview.jsx';

export function HomePage() {
  const { events, branding } = useLoaderData();

  return (
    <div>
      <Hero />
      <Pillars />
      <EventsPreview events={events} />
      <TeamPreview branding={branding} />
    </div>
  );
}

export default HomePage;
