import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/routes/Home";
import Dashboard from "@/routes/Dashboard";
import Login from "@/routes/Login";
import Register from "@/routes/Register";
import ExercisePage from "@/components/exercises/ExercisePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* защищённые */}

        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        <Route
          path="/dashboard/:id"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exercises/:id"
          element={
            <ProtectedRoute>
              <ExercisePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
