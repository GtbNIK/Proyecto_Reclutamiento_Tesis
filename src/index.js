/*!
=========================================================
* Argon Dashboard React - v1.2.4
=========================================================
*/
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { JugadoresProvider } from "./context/JugadoresContext"; // Importa el Provider

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import App from "./routes";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <JugadoresProvider> {/* Envuelve tu App con el Provider */}
      <App />
    </JugadoresProvider>
  </BrowserRouter>
);