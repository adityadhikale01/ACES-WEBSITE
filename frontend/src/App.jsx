import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/authContext.jsx';
import router from './app/router.jsx';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
