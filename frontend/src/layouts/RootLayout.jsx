import { Outlet, ScrollRestoration } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

function RootLayout() {
  return (
    <div className="app">
      <Navbar />

      <main className="app-content">
        <Outlet />
      </main>

      <Footer />

      <ScrollRestoration />
    </div>
  );
}

export default RootLayout;