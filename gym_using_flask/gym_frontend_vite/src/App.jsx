import { Routes, Route } from "react-router-dom";

import Register from "./register.jsx";
import Login from "./login.jsx";
import Home from "./home.jsx";
import Profile from "./profile.jsx";
import MainLayout from "./mainlayout.jsx";
import AuthLayout from "./Authlayout.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout/>}>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
      </Route>

      <Route element={<MainLayout/>}>
        <Route path="/home" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
      </Route>
    </Routes>
  );
}
