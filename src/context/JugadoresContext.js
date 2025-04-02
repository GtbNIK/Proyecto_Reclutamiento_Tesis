import React, { createContext, useState, useContext } from 'react';

const JugadoresContext = createContext();

export const JugadoresProvider = ({ children }) => {
  const [jugadoresReclutados, setJugadoresReclutados] = useState({});

  const agregarJugadores = (nuevosJugadores) => {
    setJugadoresReclutados(prev => ({ ...prev, ...nuevosJugadores }));
  };

  return (
    <JugadoresContext.Provider value={{ jugadoresReclutados, agregarJugadores }}>
      {children}
    </JugadoresContext.Provider>
  );
};

export const useJugadores = () => useContext(JugadoresContext);