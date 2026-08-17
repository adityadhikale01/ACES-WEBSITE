import { createBrowserRouter } from "react-router-dom";

import RootLayout from "../layouts/RootLayout";

import Home from "../pages/Homepg/HomePg.jsx";
import About from "../pages/About";
import Events from "../pages/Events";
import Committee from "../pages/Committee";
import Activities from "../pages/Activities";
import Achievements from "../pages/Achievements";
import Gallery from "../pages/Gallery";
import Join from "../pages/Join";
import ErrorPage from "../pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,

    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        path: "about",
        element: <About />,
      },

      {
        path: "events",
        element: <Events />,
      },

      {
        path: "committee",
        element: <Committee />,
      },

      {
        path: "activities",
        element: <Activities />,
      },

      {
        path: "achievements",
        element: <Achievements />,
      },

      {
        path: "gallery",
        element: <Gallery />,
      },

      {
        path: "join",
        element: <Join />,
      },
    ],
  },
]);

export default router;