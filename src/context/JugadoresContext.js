import React, { createContext, useState, useContext, useEffect } from 'react';

const JugadoresContext = createContext();

export const JugadoresProvider = ({ children }) => {
  // Cargar datos iniciales desde localStorage
  const [jugadoresReclutados, setJugadoresReclutados] = useState(() => {
    const saved = localStorage.getItem('jugadoresReclutados');
    return saved ? JSON.parse(saved) : {};
  });

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('jugadoresReclutados', JSON.stringify(jugadoresReclutados));
  }, [jugadoresReclutados]);

  const agregarJugadores = (nuevosJugadores) => {
    setJugadoresReclutados(prev => ({ ...prev, ...nuevosJugadores }));
  };

  return (
    <JugadoresContext.Provider value={{ jugadoresReclutados, setJugadoresReclutados, agregarJugadores }}>
      {children}
    </JugadoresContext.Provider>
  );
};

export const useJugadores = () => useContext(JugadoresContext);