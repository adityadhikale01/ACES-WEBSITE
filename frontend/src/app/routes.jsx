import React from 'react';
import HomePage from '../pages/HomePage/HomePage.jsx';
import EventsPage from '../pages/EventsPage/EventsPage.jsx';
import EventDetailPage from '../pages/EventDetailPage/EventDetailPage.jsx';
import TeamPage from '../pages/TeamPage/TeamPage.jsx';
import AboutPage from '../pages/AboutPage/AboutPage.jsx';
import ActivitiesPage from '../pages/ActivitiesPage/ActivitiesPage.jsx';
import AchievementsPage from '../pages/AchievementsPage/AchievementsPage.jsx';
import GalleryPage from '../pages/GalleryPage/GalleryPage.jsx';
import JoinPage from '../pages/JoinPage/JoinPage.jsx';
import ContactPage from '../pages/ContactPage/ContactPage.jsx';
import LoginPage from '../pages/LoginPage/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage/RegisterPage.jsx';
import MemberDashboard from '../pages/MemberDashboard/MemberDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard.jsx';
import ProtectedRoute from '../auth/ProtectedRoute.jsx';

import { homeLoader } from '../loaders/homeLoader.js';
import { eventsLoader } from '../loaders/eventsLoader.js';
import { eventDetailLoader } from '../loaders/eventDetailLoader.js';
import { teamLoader } from '../loaders/teamLoader.js';
import { activitiesLoader } from '../loaders/activitiesLoader.js';
import { galleryLoader } from '../loaders/galleryLoader.js';
import { adminLoader } from '../loaders/adminLoader.js';

import { loginAction } from '../actions/loginAction.js';
import { registerAction } from '../actions/registerAction.js';
import { contactAction } from '../actions/contactAction.js';
import { applyAction } from '../actions/applyAction.js';

export const routes = [
  {
    index: true,
    element: <HomePage />,
    loader: homeLoader,
  },
  {
    path: 'events',
    element: <EventsPage />,
    loader: eventsLoader,
  },
  {
    path: 'events/:slug',
    element: <EventDetailPage />,
    loader: eventDetailLoader,
  },
  {
    path: 'team',
    element: <TeamPage />,
    loader: teamLoader,
  },
  {
    path: 'about',
    element: <AboutPage />,
  },
  {
    path: 'activities',
    element: <ActivitiesPage />,
    loader: activitiesLoader,
  },
  {
    path: 'achievements',
    element: <AchievementsPage />,
  },
  {
    path: 'gallery',
    element: <GalleryPage />,
    loader: galleryLoader,
  },
  {
    path: 'join',
    element: <JoinPage />,
    action: applyAction,
  },
  {
    path: 'apply',
    element: <JoinPage />,
    action: applyAction,
  },
  {
    path: 'contact',
    element: <ContactPage />,
    action: contactAction,
  },
  {
    path: 'login',
    element: <LoginPage />,
    action: loginAction,
  },
  {
    path: 'register',
    element: <RegisterPage />,
    action: registerAction,
  },
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <MemberDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    loader: adminLoader,
  },
];

export default routes;
