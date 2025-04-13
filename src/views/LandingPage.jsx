import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import "assets/css/LandingPage.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
import ReclutamientoForm from "./ReclutamientoForm";

const LandingPage = () => {
  const [formModalOpen, setFormModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const toggleFormModal = () => {
    setFormModalOpen(!formModalOpen);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <img src={require("assets/img/brand/logo.png")} alt="Logo" />
        </div>
        <Link to="/auth/login">
          <Button color="primary" className="login-button">
            Log-In
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="content-wrapper">
          {/* Countdown Section */}
          <div className="countdown-container" data-aos="fade-down">
            <h1>Próximo Reclutamiento en:</h1>
            <div className="countdown-box">
              <span>30</span>
              <span>días</span>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="cta-container" data-aos="fade-up" data-aos-delay="300">
            <p className="cta-text">
              ¿Quieres cumplir tu sueño de ser un futbolista profesional?
              <br />
              ¡Envía tu formulario y demuéstranos de qué estás hecho!
            </p>
            <Button 
              color="success" 
              size="lg" 
              className="cta-button"
              onClick={toggleFormModal}
            >
              Enviar Solicitud de Reclutamiento
            </Button>
          </div>
        </div>
      </main>

      {/* Modal del formulario */}
      <ReclutamientoForm isOpen={formModalOpen} toggle={toggleFormModal} />

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2024 Sistema de Reclutamiento de Futbolistas. Todos los derechos reservados.</p>
        <p>Autores: Neil Rangel - Edgar Castillo</p>
      </footer>
    </div>
  );
};

export default LandingPage; 