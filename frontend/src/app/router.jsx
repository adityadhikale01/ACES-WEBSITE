import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout.jsx';
import ErrorPage from '../pages/ErrorPage/ErrorPage.jsx';
import { routes } from './routes.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: routes,
  },
]);

export default router;
