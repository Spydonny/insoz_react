import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/routes/Home";
import Dashboard from "@/routes/Dashboard";
import Login from "@/routes/Login";
import Register from "@/routes/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
