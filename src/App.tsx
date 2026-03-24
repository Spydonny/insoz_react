import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/routes/Home";
import Dashboard from "@/routes/Dashboard";
import Login from "@/routes/Login";
import Register from "@/routes/Register";
import ExercisePage from "@/components/exercises/ExercisePage";
import Network from "@/routes/Network";
import NetworkProfile from "@/routes/NetworkProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — все внутри Layout с сайдбаром */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/:id"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/exercises/:id"
          element={
            <ProtectedLayout>
              <ExercisePage />
            </ProtectedLayout>
          }
        />

        {/* InSoz Network */}
        <Route
          path="/network"
          element={
            <ProtectedLayout>
              <Network />
            </ProtectedLayout>
          }
        />
        <Route
          path="/network/profile/:id"
          element={
            <ProtectedLayout>
              <NetworkProfile />
            </ProtectedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
