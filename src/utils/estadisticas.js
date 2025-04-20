// Utilidad para consolidar estadísticas de todas las sesiones por jugador
// Devuelve dos arrays: jugadoresCampo y porteros

function consolidarEstadisticasPorJugador(sesiones, jugadoresReclutados) {
  const jugadoresCampo = {};
  const porteros = {};

  Object.entries(jugadoresReclutados).forEach(([cedula, jugador]) => {
    const esPortero = jugador.posicion && jugador.posicion.toLowerCase().includes('portero');
    const baseStats = {
      cedula,
      nombre: jugador.nombre,
      apellido: jugador.apellido,
      posicion: jugador.posicion,
      sesiones: 0,
      goles: 0, asistencias: 0, duelosGanados: 0, duelosTotales: 0, efectividadPases: 0,
      pasesCompletados: 0, pasesIntentados: 0, tirosAlArco: 0, tirosTotales: 0, precisionTiros: 0,
      recuperaciones: 0, perdidas: 0, intercepciones: 0, bloqueos: 0,
      centrosCompletados: 0, centrosIntentados: 0, precisionCentros: 0,
      paradasRealizadas: 0, tirosAPorteria: 0, golesConcedidos: 0,
      pasesExitososPortero: 0,
      duelosManoAManoGanados: 0, duelosManoAManoTotales: 0
    };
    if (esPortero) {
      porteros[cedula] = { ...baseStats };
    } else {
      jugadoresCampo[cedula] = { ...baseStats };
    }
  });

  sesiones.forEach(sesion => {
    sesion.jugadores.forEach(jugador => {
      const cedula = jugador.cedula;
      const posicion = jugador.posicion || (jugadoresReclutados[cedula]?.posicion || '').toLowerCase();
      const esPortero = posicion && posicion.includes('portero');
      const target = esPortero ? porteros : jugadoresCampo;
      if (!target[cedula]) return;
      target[cedula].sesiones += 1;
      if (esPortero) {
        // Solo sumar campos de portero
        target[cedula].paradasRealizadas += jugador.paradasRealizadas || 0;
        target[cedula].tirosAPorteria += jugador.tirosAPorteria || 0;
        target[cedula].golesConcedidos += (jugador.tirosAPorteria || 0) - (jugador.paradasRealizadas || 0);
        target[cedula].pasesExitososPortero += jugador.pasesExitososPortero || 0;
        target[cedula].duelosManoAManoGanados += jugador.duelosManoAManoGanados || 0;
        target[cedula].duelosManoAManoTotales += jugador.duelosManoAManoTotales || 0;
      } else {
        // Solo sumar campos de jugador de campo
        target[cedula].goles += jugador.goles || 0;
        target[cedula].asistencias += jugador.asistencias || 0;
        target[cedula].duelosGanados += jugador.duelos?.ganados || 0;
        target[cedula].duelosTotales += jugador.duelos?.total || 0;
        target[cedula].pasesCompletados += jugador.pases?.completados || 0;
        target[cedula].pasesIntentados += jugador.pases?.intentados || 0;
        target[cedula].recuperaciones += jugador.posesion?.recuperaciones || 0;
        target[cedula].perdidas += jugador.posesion?.perdidas || 0;
        target[cedula].intercepciones += jugador.intercepciones || 0;
        target[cedula].bloqueos += jugador.bloqueos || 0;
        target[cedula].centrosCompletados += jugador.centros?.completados || 0;
        target[cedula].centrosIntentados += jugador.centros?.intentados || 0;
        target[cedula].tirosAlArco += jugador.tiros?.alArco || 0;
        target[cedula].tirosTotales += jugador.tiros?.total || 0;
      }
    });
  });

  const calcularPromedio = (total, sesiones) => sesiones > 0 ? (total / sesiones).toFixed(2) : '0.00';
  const calcularPorcentaje = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

  const jugadoresCampoArray = Object.values(jugadoresCampo).map(j => ({
    ...j,
    promedioGoles: calcularPromedio(j.goles, j.sesiones),
    promedioAsistencias: calcularPromedio(j.asistencias, j.sesiones),
    promedioDuelosGanados: calcularPromedio(j.duelosGanados, j.sesiones),
    promedioPasesCompletados: calcularPromedio(j.pasesCompletados, j.sesiones),
    promedioPasesIntentados: calcularPromedio(j.pasesIntentados, j.sesiones),
    promedioRecuperaciones: calcularPromedio(j.recuperaciones, j.sesiones),
    promedioPerdidas: calcularPromedio(j.perdidas, j.sesiones),
    promedioIntercepciones: calcularPromedio(j.intercepciones, j.sesiones),
    promedioBloqueos: calcularPromedio(j.bloqueos, j.sesiones),
    promedioCentrosCompletados: calcularPromedio(j.centrosCompletados, j.sesiones),
    promedioCentrosIntentados: calcularPromedio(j.centrosIntentados, j.sesiones),
    promedioTirosAlArco: calcularPromedio(j.tirosAlArco, j.sesiones),
    promedioTirosTotales: calcularPromedio(j.tirosTotales, j.sesiones),
    efectividadPases: calcularPorcentaje(j.pasesCompletados, j.pasesIntentados),
    precisionTiros: calcularPorcentaje(j.tirosAlArco, j.tirosTotales),
    precisionCentros: calcularPorcentaje(j.centrosCompletados, j.centrosIntentados),
    porcentajeDuelos: calcularPorcentaje(j.duelosGanados, j.duelosTotales)
  }));

  const porterosArray = Object.values(porteros).map(j => ({
    ...j,
    promedioParadas: calcularPromedio(j.paradasRealizadas, j.sesiones),
    promedioTirosAPorteria: calcularPromedio(j.tirosAPorteria, j.sesiones),
    promedioGolesConcedidos: calcularPromedio(j.golesConcedidos, j.sesiones),
    promedioPasesExitosos: calcularPromedio(j.pasesExitososPortero, j.sesiones),
    promedioDuelosManoAManoGanados: calcularPromedio(j.duelosManoAManoGanados, j.sesiones),
    promedioDuelosManoAManoTotales: calcularPromedio(j.duelosManoAManoTotales, j.sesiones),
    porcentajeParadas: calcularPorcentaje(j.paradasRealizadas, j.tirosAPorteria),
    porcentajeDuelosManoAMano: calcularPorcentaje(j.duelosManoAManoGanados, j.duelosManoAManoTotales)
  }));

  return { jugadoresCampo: jugadoresCampoArray, porteros: porterosArray };
}

export { consolidarEstadisticasPorJugador }; 