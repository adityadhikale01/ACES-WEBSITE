import {
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <ScrollRestoration />
    </>
  );
}

export default App;