import {
  BrowserRouter,
  Routes,
  Route
}
from "react-router-dom";

import Landing
from "./pages/Landing/Landing";

import Login
from "./pages/Login/Login";

import Host
from "./pages/Host/Host";

import Team
from "./pages/Team/Team";

import Viewer
from "./pages/Viewer/Viewer";

import ProtectedRoute
from "./routes/ProtectedRoute";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/viewer"
          element={<Viewer />}
        />

        <Route
          path="/host"
          element={

            <ProtectedRoute>

              <Host />

            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId"
          element={

            <ProtectedRoute>

              <Team />

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}