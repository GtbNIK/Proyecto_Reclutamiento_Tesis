/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Login from "views/examples/Login.js";
import Tables from "views/examples/Tables.js";
import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import LandingPage from "views/LandingPage.jsx";
import Jugadores from "views/examples/Jugadores.js";
import Sesiones from "views/examples/Sesiones";
import Estadisticas from "views/examples/Estadisticas";

// Rutas para el sidebar y navegación interna
const routes = [
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth"
  },
  {
    path: "/principal",
    name: "Principal",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin"
  },
  {
    path: "/solicitudes",
    name: "Solicitudes",
    icon: "ni ni-single-copy-04 text-blue",
    component: Tables,
    layout: "/admin"
  },
  {
    path: "/user-profile",
    name: "Perfil de Usuario",
    icon: "ni ni-single-02 text-yellow",
    component: Profile,
    layout: "/admin"
  },
  {
    path: "/tables",
    name: "Tablas",
    icon: "ni ni-bullet-list-67 text-red",
    component: Tables,
    layout: "/admin"
  },
  {
    path: "/jugadores",
    name: "Jugadores",
    icon: "ni ni-single-02 text-yellow",
    component: Jugadores,  // Usa el nuevo componente aquí
    layout: "/admin"
  },
  {
    path: "/sesiones",
    name: "Sesiones",
    icon: "ni ni-calendar-grid-58 text-blue",
    component: Sesiones,
    layout: "/admin"
  },
  {
    path: "/estadisticas",
    name: "Estadísticas",
    icon: "ni ni-chart-bar-32 text-green",
    component: Estadisticas,
    layout: "/admin"
  },
];

// Componente principal para el enrutamiento
function App() {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogoutModalOpen(false);
    navigate("/");
  };

  return (
    <Routes>
      {/* Landing Page Route */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<Admin />} />
      
      {/* Auth Routes */}
      <Route path="/auth/*" element={<Auth />} />

      {/* Redirect to landing page if no route matches */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export { App as default, routes };
