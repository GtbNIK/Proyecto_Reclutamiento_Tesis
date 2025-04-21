/*!
=========================================================
* Sesiones Component - v2.0
* Estadísticas Avanzadas de Fútbol
=========================================================
*/
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Input,
  Label,
  Badge,
  Progress
} from "reactstrap";
import { useJugadores } from "../../context/JugadoresContext";

const Sesiones = () => {
  const { jugadoresReclutados } = useJugadores();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
  const [sesionAEliminar, setSesionAEliminar] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [sesiones, setSesiones] = useState(() => {
    const saved = localStorage.getItem('sesionesEntrenamiento');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Estado inicial si no hay nada guardado
    return [
    {
      id: 1,
      titulo: "Sesión 1",
        fecha: new Date().toISOString().split('T')[0],
      tipo: "ofensiva",
      jugadores: Object.keys(jugadoresReclutados).map(cedula => ({
        cedula,
        nombre: jugadoresReclutados[cedula].nombre,
        apellido: jugadoresReclutados[cedula].apellido,
        // Estadísticas básicas
        goles: 0,
        asistencias: 0,
        // Estadísticas avanzadas
          pases: { completados: null, intentados: null, efectividad: null },
          tiros: { alArco: null, total: null, precision: null, xG: null },
          duelos: { ganados: null, total: null, porcentaje: null },
        posesion: { recuperaciones: 0, perdidas: 0 },
          centros: { completados: null, intentados: null, precision: null },
        intercepciones: 0,
        bloqueos: 0,
        duelosAereos: { ganados: 0, total: 0, porcentaje: 0 }
      }))
    }
    ];
  });
  const [editandoTitulo, setEditandoTitulo] = useState(null);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoTipoSesion, setNuevoTipoSesion] = useState("ofensiva");
  const [nuevaFecha, setNuevaFecha] = useState(""); // Estado para la nueva fecha
  const [errorModal, setErrorModal] = useState("");
  const [modalNuevaSesionOpen, setModalNuevaSesionOpen] = useState(false);
  const [nuevoNombreSesion, setNuevoNombreSesion] = useState("");
  const [nuevaFechaSesion, setNuevaFechaSesion] = useState("");

  // Guardar sesiones en LocalStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('sesionesEntrenamiento', JSON.stringify(sesiones));
  }, [sesiones]);

  // Definir las estadísticas relevantes por posición
  const estadisticasPorPosicion = {
    Defensa: [
      { key: 'goles', label: 'Goles' },
      { key: 'asistencias', label: 'Asistencias' },
      { key: 'efectividadPases', label: 'Efectividad de Pases' },
      { key: 'efectividadTiros', label: 'Efectividad de Tiros' },
      { key: 'recuperaciones', label: 'Recuperaciones' },
      { key: 'intercepciones', label: 'Intercepciones' },
      { key: 'bloqueos', label: 'Bloqueos' },
      { key: 'duelosAereos', label: 'Duelos Aéreos Ganados' }
    ],
    Mediocampista: [
      { key: 'goles', label: 'Goles' },
      { key: 'asistencias', label: 'Asistencias' },
      { key: 'efectividadPases', label: 'Efectividad de Pases' },
      { key: 'efectividadTiros', label: 'Efectividad de Tiros' },
      { key: 'recuperaciones', label: 'Recuperaciones' },
      { key: 'duelosGanados', label: 'Duelos Ganados' }
    ],
    Delantero: [
      { key: 'goles', label: 'Goles' },
      { key: 'asistencias', label: 'Asistencias' },
      { key: 'efectividadPases', label: 'Efectividad de Pases' },
      { key: 'efectividadTiros', label: 'Efectividad de Tiros' }
    ],
    Portero: [
      { key: 'porcentajeParadas', label: 'Porcentaje de paradas' },
      { key: 'golesConcedidos', label: 'Goles Concedidos' },
      { key: 'pasesExitososPortero', label: 'Pases Exitosos (Portero)' },
      { key: 'duelosManoAManoGanados', label: 'Porcentaje de duelos Mano a Mano ganados' },
      { key: 'duelosGanados', label: 'Duelos Ganados' }
    ]
  };

  // Función para obtener la posición real del jugador
  const getPosicionJugador = (jugador) => {
    if (jugador.posicion) return jugador.posicion;
    if (jugador.cedula && jugadoresReclutados[jugador.cedula]) {
      return jugadoresReclutados[jugador.cedula].posicion;
    }
    return '';
  };

  // Función para obtener las estadísticas relevantes según la posición
  const getEstadisticasJugador = (jugador) => {
    const posicion = getPosicionJugador(jugador);
    if (!posicion) return [];
    if (posicion.toLowerCase().includes('defensa')) return estadisticasPorPosicion.Defensa;
    if (posicion.toLowerCase().includes('mediocampista')) return estadisticasPorPosicion.Mediocampista;
    if (posicion.toLowerCase().includes('delantero')) return estadisticasPorPosicion.Delantero;
    if (posicion.toLowerCase().includes('portero')) return estadisticasPorPosicion.Portero;
    return [];
  };

  // Abre el modal para editar una estadística específica
  const handleStatClick = (sesionId, jugador, statName) => {
    setSelectedPlayer({ ...jugador, sesionId });
    setSelectedStat(statName);
    setErrorModal(""); // Limpiar error al abrir un nuevo modal
    setModalOpen(true);
  };

  // Calcula la efectividad de pases
  const calcularEfectividadPases = (completados, intentados) => {
    return intentados > 0 ? Math.round((completados / intentados) * 100) : 0;
  };

  // Calcula la precisión de tiros y xG (Expected Goals)
  const calcularPrecisionTiros = (alArco, total) => {
    const precision = total > 0 ? Math.round((alArco / total) * 100) : 0;
    // Fórmula simplificada de xG (puede ajustarse según necesidades)
    const xG = alArco > 0 ? (alArco * 0.3).toFixed(1) : 0; // Suponiendo 30% de probabilidad por tiro al arco
    return { precision, xG };
  };

  // Calcula porcentaje de duelos ganados
  const calcularPorcentajeDuelos = (ganados, total) => {
    return total > 0 ? Math.round((ganados / total) * 100) : 0;
  };

  // Calcula precisión de centros
  const calcularPrecisionCentros = (completados, intentados) => {
    return intentados > 0 ? Math.round((completados / intentados) * 100) : 0;
  };

  // Función para validar porcentajes
  const validarPorcentaje = (porcentaje) => {
    if (porcentaje > 100) {
      alert("El porcentaje no puede ser mayor a 100%. Por favor, ajusta los valores ingresados.");
      return false;
    }
    return true;
  };

  // Función para validar las estadísticas antes de guardar
  const validarEstadisticas = (jugador) => {
    const errores = [];

    // Validar tiros
    if (jugador.tiros.alArco !== null && jugador.tiros.total !== null) {
      if (jugador.tiros.alArco > jugador.tiros.total) {
        errores.push("Los tiros al arco no pueden ser mayores que los tiros totales");
      }
    }

    // Validar pases
    if (jugador.pases.completados !== null && jugador.pases.intentados !== null) {
      if (jugador.pases.completados > jugador.pases.intentados) {
        errores.push("Los pases completados no pueden ser mayores que los pases intentados");
      }
    }

    // Validar duelos
    if (jugador.duelos.ganados !== null && jugador.duelos.total !== null) {
      if (jugador.duelos.ganados > jugador.duelos.total) {
        errores.push("Los duelos ganados no pueden ser mayores que los duelos totales");
      }
    }

    // Validar centros
    if (jugador.centros.completados !== null && jugador.centros.intentados !== null) {
      if (jugador.centros.completados > jugador.centros.intentados) {
        errores.push("Los centros completados no pueden ser mayores que los centros intentados");
      }
    }

    return errores;
  };

  // Guarda los datos de la estadística editada
  const handleSaveStats = () => {
    setErrorModal(""); // Limpiar error previo
    const errores = validarEstadisticas(selectedPlayer);
    
    // Validación especial para portero
    if (selectedStat === 'porcentajeParadas') {
      if ((selectedPlayer.paradasRealizadas ?? 0) > (selectedPlayer.tirosAPorteria ?? 0)) {
        setErrorModal('Las paradas no pueden ser mayores que los tiros a portería');
        return;
      }
      if ((selectedPlayer.paradasRealizadas ?? 0) < 0 || (selectedPlayer.tirosAPorteria ?? 0) < 0) {
        setErrorModal('No se permiten valores negativos en las estadísticas de portero.');
        return;
      }
    }
    if (selectedStat === 'duelosManoAManoGanados') {
      const ganados = Number(selectedPlayer.duelosManoAManoGanados ?? 0);
      const totales = Number(selectedPlayer.duelosManoAManoTotales ?? 0);
      if (ganados < 0 || totales < 0) {
        setErrorModal('No se permiten valores negativos en los duelos mano a mano.');
        return;
      }
      if (ganados > totales) {
        setErrorModal('Los duelos mano a mano ganados no pueden ser mayores que los duelos mano a mano totales');
        return;
      }
    }
    // Validación especial para duelos aéreos
    if (selectedStat === 'duelosAereos') {
      const ganados = Number(selectedPlayer.duelosAereos?.ganados ?? 0);
      const totales = Number(selectedPlayer.duelosAereos?.total ?? 0);
      if (ganados < 0 || totales < 0) {
        setErrorModal('No se permiten valores negativos en los duelos aéreos.');
        return;
      }
      if (ganados > totales) {
        setErrorModal('Los duelos aéreos ganados no pueden ser mayores que los duelos aéreos totales');
        return;
      }
    }

    // Validación general para evitar números negativos y caracteres no numéricos (ya implementada, pero reforzar para campos vacíos)
    const camposNumericos = [
      'goles', 'asistencias', 'pasesExitososPortero', 'duelosManoAManoGanados',
      'paradasRealizadas', 'tirosAPorteria', 'pases.completados', 'pases.intentados', 'pases.efectividad',
      'tiros.alArco', 'tiros.total', 'tiros.precision',
      'duelos.ganados', 'duelos.total', 'duelos.porcentaje',
      'posesion.recuperaciones', 'posesion.perdidas',
      'centros.completados', 'centros.intentados', 'centros.precision',
      'intercepciones', 'bloqueos', 'distribucion', 'duelosGanados'
    ];
    for (const campo of camposNumericos) {
      let valor = selectedPlayer;
      if (campo.includes('.')) {
        const [obj, prop] = campo.split('.');
        valor = valor[obj]?.[prop];
      } else {
        valor = valor[campo];
      }
      if (valor !== undefined && valor !== null && valor !== "") {
        // Validar que sea un número válido y no negativo
        if (typeof valor === 'string' && valor.trim() !== '' && !/^\d+(\.\d+)?$/.test(valor)) {
          setErrorModal('Solo se permiten números positivos en las estadísticas. Corrige el campo: ' + campo.replace('.', ' '));
          return;
        }
        if (isNaN(valor) || Number(valor) < 0) {
          setErrorModal('No se permiten valores negativos ni caracteres especiales/letras en las estadísticas. Corrige el campo: ' + campo.replace('.', ' '));
          return;
        }
      }
    }

    if (errores.length > 0) {
      setErrorModal(errores.join('\n'));
      return;
    }

    // Calcular estadísticas derivadas
    const jugadorActualizado = { ...selectedPlayer };

    // Calcular efectividad de pases
    if (jugadorActualizado.pases.completados !== null && jugadorActualizado.pases.intentados !== null) {
      jugadorActualizado.pases.efectividad = jugadorActualizado.pases.intentados > 0 
        ? Math.round((jugadorActualizado.pases.completados / jugadorActualizado.pases.intentados) * 100)
        : null;
    }

    // Calcular precisión de tiros y xG
    if (jugadorActualizado.tiros.alArco !== null && jugadorActualizado.tiros.total !== null) {
      const precision = jugadorActualizado.tiros.total > 0 
        ? Math.round((jugadorActualizado.tiros.alArco / jugadorActualizado.tiros.total) * 100)
        : null;
      const xG = jugadorActualizado.tiros.alArco > 0 
        ? (jugadorActualizado.tiros.alArco * 0.3).toFixed(1)
        : null;
      jugadorActualizado.tiros.precision = precision;
      jugadorActualizado.tiros.xG = xG;
    }

    // Calcular porcentaje de duelos
    if (jugadorActualizado.duelos.ganados !== null && jugadorActualizado.duelos.total !== null) {
      jugadorActualizado.duelos.porcentaje = jugadorActualizado.duelos.total > 0
        ? Math.round((jugadorActualizado.duelos.ganados / jugadorActualizado.duelos.total) * 100)
        : null;
    }

    // Calcular precisión de centros
    if (jugadorActualizado.centros.completados !== null && jugadorActualizado.centros.intentados !== null) {
      jugadorActualizado.centros.precision = jugadorActualizado.centros.intentados > 0
        ? Math.round((jugadorActualizado.centros.completados / jugadorActualizado.centros.intentados) * 100)
        : null;
    }

    setSesiones(prevSesiones =>
      prevSesiones.map(sesion =>
        sesion.id === selectedPlayer.sesionId
          ? {
              ...sesion,
              jugadores: sesion.jugadores.map(j =>
                j.cedula === selectedPlayer.cedula ? jugadorActualizado : j
              )
            }
          : sesion
      )
    );
    setModalOpen(false);
    setSelectedStat(null);
  };

  // Funciones para manejar cambios en los inputs
  const handlePasesChange = (e, field) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedPlayer(prev => ({
          ...prev,
          pases: {
        ...prev.pases,
        [field]: value
          }
    }));
  };

  const handleTirosChange = (e, field) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedPlayer(prev => ({
          ...prev,
          tiros: {
        ...prev.tiros,
        [field]: value
          }
    }));
  };

  const handleDuelosChange = (e, field) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedPlayer(prev => ({
          ...prev,
          duelos: {
        ...prev.duelos,
        [field]: value
          }
    }));
  };

  const handleCentrosChange = (e, field) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedPlayer(prev => ({
          ...prev,
          centros: {
        ...prev.centros,
        [field]: value
          }
    }));
  };

  const handleSimpleStatChange = (e, statName) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedPlayer(prev => ({
      ...prev,
      [statName]: value
    }));
  };

  const handlePosesionChange = (e, field) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedPlayer(prev => ({
      ...prev,
      posesion: {
        ...prev.posesion,
        [field]: value
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    // Formato DD-MM-YY (últimos 2 dígitos del año)
    return `${day}-${month}-${year.slice(-2)}`;
  };

  const iniciarEdicionTitulo = (sesionId, tituloActual) => {
    setEditandoTitulo(sesionId);
    setNuevoTitulo(tituloActual);
  };
  
  const guardarTitulo = (sesionId) => {
    setSesiones(prevSesiones =>
      prevSesiones.map(sesion =>
        sesion.id === sesionId ? { ...sesion, titulo: nuevoTitulo, fecha: nuevaFecha || sesion.fecha } : sesion
      )
    );
    setEditandoTitulo(null);
  };

  const confirmarEliminacion = (sesionId) => {
    setSesionAEliminar(sesionId);
    setModalConfirmacionOpen(true);
  };
  
  const eliminarSesion = () => {
    setSesiones(prevSesiones => prevSesiones.filter(sesion => sesion.id !== sesionAEliminar));
    setModalConfirmacionOpen(false);
    setSesionAEliminar(null);
  };

  // Función para agregar una nueva sesión
  const agregarNuevaSesion = () => {
    setModalNuevaSesionOpen(true);
  };

  const confirmarAgregarSesion = () => {
    if (!nuevoNombreSesion.trim() || !nuevaFechaSesion) {
      alert('Por favor, completa el nombre y la fecha de la sesión.');
      return;
    }
    const nuevaSesion = {
      id: sesiones.length + 1,
      titulo: nuevoNombreSesion,
      fecha: nuevaFechaSesion,
      tipo: "ofensiva",
      jugadores: Object.keys(jugadoresReclutados).map(cedula => ({
        cedula,
        nombre: jugadoresReclutados[cedula].nombre,
        apellido: jugadoresReclutados[cedula].apellido,
        goles: 0,
        asistencias: 0,
        pases: { completados: 0, intentados: 0, efectividad: 0 },
        tiros: { alArco: 0, total: 0, precision: 0, xG: 0 },
        duelos: { ganados: 0, total: 0, porcentaje: 0 },
        posesion: { recuperaciones: 0, perdidas: 0 },
        centros: { completados: 0, intentados: 0, precision: 0 },
        intercepciones: 0,
        bloqueos: 0,
        duelosAereos: { ganados: 0, total: 0, porcentaje: 0 }
      }))
    };
    setSesiones(prevSesiones => [...prevSesiones, nuevaSesion]);
    setModalNuevaSesionOpen(false);
    setNuevoNombreSesion("");
    setNuevaFechaSesion("");
  };

  // Construir lista de todas las estadísticas únicas de todas las posiciones
  const allStats = Array.from(new Set([
    ...estadisticasPorPosicion.Defensa,
    ...estadisticasPorPosicion.Mediocampista,
    ...estadisticasPorPosicion.Delantero,
    ...estadisticasPorPosicion.Portero
  ].map(est => est.key)))
    .map(key => {
      // Buscar el label correspondiente
      const found = [
        ...estadisticasPorPosicion.Defensa,
        ...estadisticasPorPosicion.Mediocampista,
        ...estadisticasPorPosicion.Delantero,
        ...estadisticasPorPosicion.Portero
      ].find(est => est.key === key);
      return { key, label: found ? found.label : key };
    });

  // Función para obtener el valor y el onClick de cada estadística
  const getStatCell = (sesion, jugador, est, handleStatClick) => {
    switch(est.key) {
      case 'goles':
        return (
          <td key="goles">
            <Badge 
              color="success" 
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => handleStatClick(sesion.id, jugador, 'goles')}
            >
              {jugador.goles ?? '-'}
            </Badge>
          </td>
        );
      case 'asistencias':
        return (
          <td key="asistencias">
            <Badge 
              color="info" 
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => handleStatClick(sesion.id, jugador, 'asistencias')}
            >
              {jugador.asistencias ?? '-'}
            </Badge>
          </td>
        );
      case 'recuperaciones':
        return (
          <td key="recuperaciones">
            <Badge 
              color="primary" 
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => handleStatClick(sesion.id, jugador, 'posesion')}
            >
              {jugador.posesion?.recuperaciones ?? '-'}
            </Badge>
          </td>
        );
      case 'intercepciones':
        return (
          <td key="intercepciones">
            <Badge 
              color="danger" 
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => handleStatClick(sesion.id, jugador, 'defensa')}
            >
              {jugador.intercepciones ?? '-'}
            </Badge>
          </td>
        );
      case 'bloqueos':
        return (
          <td key="bloqueos">
            <Badge 
              color="danger" 
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => handleStatClick(sesion.id, jugador, 'defensa')}
            >
              {jugador.bloqueos ?? '-'}
            </Badge>
          </td>
        );
      case 'duelosAereos':
        return (
          <td key="duelosAereos">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'duelosAereos')}>
              <Progress
                value={jugador.duelosAereos?.total > 0 ? Math.round((jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) * 100) : 0}
                color={jugador.duelosAereos?.total > 0 && (jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) > 0.6 ? 'success' : 'warning'}
                style={{ height: '23px' }}
              >
                {jugador.duelosAereos?.total > 0 ? Math.round((jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) * 100) : 0}%
              </Progress>
              <small>{jugador.duelosAereos?.ganados ?? '-'} / {jugador.duelosAereos?.total ?? '-'}</small>
            </div>
          </td>
        );
      case 'efectividadPases':
        return (
          <td key="efectividadPases">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'pases')}>
              <Progress
                value={jugador.pases?.efectividad ?? 0}
                color={jugador.pases?.efectividad > 80 ? 'success' : 
                      jugador.pases?.efectividad > 60 ? 'info' : 'warning'}
                style={{ height: '23px' }}
              >
                {jugador.pases?.efectividad ?? '-'}%
              </Progress>
              <small>{jugador.pases?.completados ?? '-'} / {jugador.pases?.intentados ?? '-'}</small>
            </div>
          </td>
        );
      case 'duelosGanados':
        return (
          <td key="duelosGanados">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'duelos')}>
              <Progress
                value={jugador.duelos?.porcentaje ?? 0}
                color={jugador.duelos?.porcentaje > 60 ? 'success' : 
                      jugador.duelos?.porcentaje > 40 ? 'info' : 'warning'}
                style={{ height: '23px' }}
              >
                {jugador.duelos?.porcentaje ?? '-'}%
              </Progress>
              <small>{jugador.duelos?.ganados ?? '-'} / {jugador.duelos?.total ?? '-'}</small>
            </div>
          </td>
        );
      case 'efectividadTiros':
        return (
          <td key="efectividadTiros">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'tiros')}>
              <Progress
                value={jugador.tiros?.precision ?? 0}
                color={jugador.tiros?.precision > 50 ? 'success' : 
                      jugador.tiros?.precision > 30 ? 'info' : 'warning'}
                style={{ height: '23px' }}
              >
                {jugador.tiros?.precision ?? '-'}%
              </Progress>
              <small>{jugador.tiros?.alArco ?? '-'} / {jugador.tiros?.total ?? '-'}</small>
            </div>
          </td>
        );
      case 'porcentajeParadas': {
        // Calcular el porcentaje
        const paradas = jugador.paradasRealizadas ?? 0;
        const tiros = jugador.tirosAPorteria ?? 0;
        const porcentaje = tiros > 0 ? Math.round((paradas / tiros) * 100) : 0;
        return (
          <td key="porcentajeParadas">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'porcentajeParadas')}>
              <Progress
                value={porcentaje}
                color={porcentaje > 80 ? 'success' : porcentaje > 60 ? 'info' : 'warning'}
                style={{ height: '23px' }}
              >
                {porcentaje}%
              </Progress>
              <small>{paradas} / {tiros}</small>
            </div>
          </td>
        );
      }
      case 'golesConcedidos': {
        // Calcular goles concedidos automáticamente
        const paradas = jugador.paradasRealizadas ?? 0;
        const tiros = jugador.tirosAPorteria ?? 0;
        const golesConcedidos = Math.max(0, tiros - paradas);
        return (
          <td key="golesConcedidos">
            {golesConcedidos}
          </td>
        );
      }
      case 'pasesExitososPortero':
        return (
          <td key="pasesExitososPortero">
            <Badge 
              color="info" 
              style={{ cursor: 'pointer', fontSize: '1rem', backgroundColor: '#17a2b8', color: 'white', padding: '8px 16px', borderRadius: '12px' }}
              onClick={() => handleStatClick(sesion.id, jugador, 'pasesExitososPortero')}
            >
              {jugador.pasesExitososPortero ?? '-'}
            </Badge>
          </td>
        );
      case 'duelosManoAManoGanados': {
        // Calcular el porcentaje
        const ganados = Number(jugador.duelosManoAManoGanados ?? 0);
        const totales = Number(jugador.duelosManoAManoTotales ?? 0);
        const porcentaje = totales > 0 ? Math.round((ganados / totales) * 100) : 0;
        return (
          <td key="duelosManoAManoGanados">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'duelosManoAManoGanados')}>
              <Progress
                value={porcentaje}
                color={porcentaje > 80 ? 'success' : porcentaje > 60 ? 'info' : 'warning'}
                style={{ height: '23px' }}
              >
                {porcentaje}%
              </Progress>
              <small>{ganados} / {totales}</small>
            </div>
          </td>
        );
      }
      case 'duelosAereos':
        return (
          <td key="duelosAereos">
            <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'duelosAereos')}>
              <Progress
                value={jugador.duelosAereos?.total > 0 ? Math.round((jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) * 100) : 0}
                color={jugador.duelosAereos?.total > 0 && (jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) > 0.6 ? 'success' : 'warning'}
                style={{ height: '23px' }}
              >
                {jugador.duelosAereos?.total > 0 ? Math.round((jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) * 100) : 0}%
              </Progress>
              <small>{jugador.duelosAereos?.ganados ?? '-'} / {jugador.duelosAereos?.total ?? '-'}</small>
            </div>
          </td>
        );
      default:
        return <td key={est.key}>-</td>;
    }
  };

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Header vacío */}
          </div>
        </Container>
      </div>
      
      <Container className="mt--9" fluid>
        {sesiones.map(sesion => (
          <Row key={sesion.id} className="mb-5">
            <Col>
              <Card className="shadow">
                <CardHeader className="border-0">
                  <Row className="align-items-center">
                    <Col>
                      {editandoTitulo === sesion.id ? (
                        <>
                          <Input
                            type="text"
                            value={nuevoTitulo}
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                guardarTitulo(sesion.id);
                              }
                            }}
                            autoFocus
                          />
                          <Input
                            type="date"
                            value={nuevaFecha || sesion.fecha}
                            onChange={(e) => setNuevaFecha(e.target.value)}
                          />
                        </>
                      ) : (
                        <h3 className="mb-0" onClick={() => iniciarEdicionTitulo(sesion.id, sesion.titulo)}>
                          {sesion.titulo} - {formatDate(sesion.fecha)} {/* Mostrar la fecha */}
                        </h3>
                      )}
                    </Col>
                    <Col className="text-right">
                      {editandoTitulo === sesion.id ? (
                        <Button
                          color="#01920D"
                          size="sm"
                          onClick={() => guardarTitulo(sesion.id)}
                          className="mr-2"
                        >
                          Confirmar Cambios
                        </Button>
                      ) : (
                        <Button
                          color="success"
                          size="sm"
                          onClick={() => iniciarEdicionTitulo(sesion.id, sesion.titulo)}
                          className="mr-2"
                        >
                          Cambiar Título
                        </Button>
                      )}
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => confirmarEliminacion(sesion.id)}
                      >
                        Eliminar Sesión
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Jugador</th>
                      <th scope="col">Posición</th>
                      {allStats.filter(est => est.key !== 'bloqueos').map(est => (
                        est.key === 'recuperaciones'
                          ? <th key={est.key}>Recuperaciones/Pérdidas</th>
                          : est.key === 'intercepciones'
                            ? <th key={est.key}>Intercepciones/Bloqueos</th>
                            : <th key={est.key}>{est.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sesion.jugadores.map(jugador => (
                      <tr key={jugador.cedula}>
                        <td>{`${jugador.nombre} ${jugador.apellido}`}</td>
                        <td>{getPosicionJugador(jugador)}</td>
                        {allStats.filter(est => est.key !== 'bloqueos').map(est => {
                          // Determinar la posición del jugador
                          const posicion = getPosicionJugador(jugador)?.toLowerCase() || '';
                          const esPortero = posicion.includes('portero');
                          const esCampo = posicion.includes('defensa') || posicion.includes('lateral') || posicion.includes('mediocampista') || posicion.includes('delantero');

                          // Columnas exclusivas de portero
                          const columnasPortero = ['porcentajeParadas', 'golesConcedidos', 'pasesExitososPortero', 'duelosManoAManoGanados'];
                          // Columnas exclusivas de campo
                          const columnasCampo = ['goles', 'asistencias', 'efectividadPases', 'efectividadTiros', 'recuperaciones', 'intercepciones', 'duelosAereos', 'duelosGanados'];

                          // Si es jugador de campo y la columna es exclusiva de portero
                          if (esCampo && columnasPortero.includes(est.key)) {
                            return <td key={est.key}>-</td>;
                          }
                          // Si es portero y la columna es exclusiva de campo
                          if (esPortero && columnasCampo.includes(est.key)) {
                            return <td key={est.key}>-</td>;
                          }

                          // Renderizado especial para recuperaciones/perdidas
                          if (est.key === 'recuperaciones') {
                            if (esPortero) return <td key="recuperaciones/perdidas">-</td>;
                            return (
                              <td key="recuperaciones/perdidas">
                                <Badge
                                  color="primary"
                                  style={{ cursor: 'pointer', fontSize: '1rem' }}
                                  onClick={() => handleStatClick(sesion.id, jugador, 'posesion')}
                                >
                                  {jugador.posesion?.recuperaciones ?? '-'} / {jugador.posesion?.perdidas ?? '-'}
                                </Badge>
                              </td>
                            );
                          }
                          // Renderizado especial para intercepciones/bloqueos
                          if (est.key === 'intercepciones') {
                            if (esPortero) return <td key="intercepciones/bloqueos">-</td>;
                            return (
                              <td key="intercepciones/bloqueos">
                                <Badge
                                  color="danger"
                                  style={{ cursor: 'pointer', fontSize: '1rem' }}
                                  onClick={() => handleStatClick(sesion.id, jugador, 'defensa')}
                                >
                                  {jugador.intercepciones ?? '-'} / {jugador.bloqueos ?? '-'}
                                </Badge>
                              </td>
                            );
                          }
                          // Renderizado especial para duelos aéreos
                          if (est.key === 'duelosAereos') {
                            if (esPortero) return <td key="duelosAereos">-</td>;
                            return (
                              <td key="duelosAereos">
                                <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'duelosAereos')}>
                                  <Progress
                                    value={jugador.duelosAereos?.total > 0 ? Math.round((jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) * 100) : 0}
                                    color={jugador.duelosAereos?.total > 0 && (jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) > 0.6 ? 'success' : 'warning'}
                                    style={{ height: '23px' }}
                                  >
                                    {jugador.duelosAereos?.total > 0 ? Math.round((jugador.duelosAereos?.ganados / jugador.duelosAereos?.total) * 100) : 0}%
                                  </Progress>
                                  <small>{jugador.duelosAereos?.ganados ?? '-'} / {jugador.duelosAereos?.total ?? '-'}</small>
                                </div>
                              </td>
                            );
                          }
                          // Renderizado especial para duelos mano a mano ganados
                          if (est.key === 'duelosManoAManoGanados') {
                            if (esCampo) return <td key="duelosManoAManoGanados">-</td>;
                            // Portero: sí editable
                            const ganados = Number(jugador.duelosManoAManoGanados ?? 0);
                            const totales = Number(jugador.duelosManoAManoTotales ?? 0);
                            const porcentaje = totales > 0 ? Math.round((ganados / totales) * 100) : 0;
                            return (
                              <td key="duelosManoAManoGanados">
                                <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'duelosManoAManoGanados')}>
                                  <Progress
                                    value={porcentaje}
                                    color={porcentaje > 80 ? 'success' : porcentaje > 60 ? 'info' : 'warning'}
                                    style={{ height: '23px' }}
                                  >
                                    {porcentaje}%
                                  </Progress>
                                  <small>{ganados} / {totales}</small>
                                </div>
                              </td>
                            );
                          }
                          // Renderizado especial para porcentaje de paradas
                          if (est.key === 'porcentajeParadas') {
                            if (esCampo) return <td key="porcentajeParadas">-</td>;
                            // Portero: sí editable
                            const paradas = jugador.paradasRealizadas ?? 0;
                            const tiros = jugador.tirosAPorteria ?? 0;
                            const porcentaje = tiros > 0 ? Math.round((paradas / tiros) * 100) : 0;
                            return (
                              <td key="porcentajeParadas">
                                <div style={{ cursor: 'pointer' }} onClick={() => handleStatClick(sesion.id, jugador, 'porcentajeParadas')}>
                                  <Progress
                                    value={porcentaje}
                                    color={porcentaje > 80 ? 'success' : porcentaje > 60 ? 'info' : 'warning'}
                                    style={{ height: '23px' }}
                                  >
                                    {porcentaje}%
                                  </Progress>
                                  <small>{paradas} / {tiros}</small>
                                </div>
                              </td>
                            );
                          }
                          // Renderizado especial para goles concedidos
                          if (est.key === 'golesConcedidos') {
                            if (esCampo) return <td key="golesConcedidos">-</td>;
                            // Portero: sí editable (aunque es cálculo automático)
                            const paradas = jugador.paradasRealizadas ?? 0;
                            const tiros = jugador.tirosAPorteria ?? 0;
                            const golesConcedidos = Math.max(0, tiros - paradas);
                            return (
                              <td key="golesConcedidos">
                                {golesConcedidos}
                              </td>
                            );
                          }
                          // Renderizado especial para pases exitosos portero
                          if (est.key === 'pasesExitososPortero') {
                            if (esCampo) return <td key="pasesExitososPortero">-</td>;
                            return (
                              <td key="pasesExitososPortero">
                                <Badge 
                                  color="info" 
                                  style={{ cursor: 'pointer', fontSize: '1rem', backgroundColor: '#17a2b8', color: 'white', padding: '8px 16px', borderRadius: '12px' }}
                                  onClick={() => handleStatClick(sesion.id, jugador, 'pasesExitososPortero')}
                                >
                                  {jugador.pasesExitososPortero ?? '-'}
                                </Badge>
                              </td>
                            );
                          }
                          // Para el resto de columnas, usa getStatCell solo si corresponde
                          return getStatCell(sesion, { ...jugador, posicion: getPosicionJugador(jugador) }, est, handleStatClick);
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        ))}

        {/* Botón para agregar nueva sesión */}
        <Row>
          <Col className="text-center">
            <Button 
              style={{ backgroundColor: 'white', color: '#01920D', borderColor: '#01920D', borderWidth: 2 }} 
              onClick={agregarNuevaSesion}
            >
              Agregar Nueva Sesión
            </Button>
            <Modal isOpen={modalNuevaSesionOpen} toggle={() => setModalNuevaSesionOpen(false)} className="modal-dialog-centered">
              <ModalHeader toggle={() => setModalNuevaSesionOpen(false)}>
                Nueva Sesión
              </ModalHeader>
              <ModalBody>
                <FormGroup>
                  <Label>Nombre de la sesión</Label>
                  <Input
                    type="text"
                    value={nuevoNombreSesion}
                    onChange={e => setNuevoNombreSesion(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Fecha de la Sesión</Label>
                  <Input
                    type="date"
                    value={nuevaFechaSesion}
                    onChange={e => setNuevaFechaSesion(e.target.value)}
                    min={hoy}
                  />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button 
                  style={{ backgroundColor: '#01920D', color: 'white', borderColor: '#01920D' }} 
                  onClick={confirmarAgregarSesion}
                >
                  Confirmar
                </Button>
                <Button color="secondary" onClick={() => setModalNuevaSesionOpen(false)}>
                  Cancelar
                </Button>
              </ModalFooter>
            </Modal>
          </Col>
        </Row>

        {/* Modal para editar estadísticas */}
        <Modal
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
          className="modal-dialog-centered"
          size="lg"
        >
          <ModalHeader toggle={() => setModalOpen(false)}>
            Editar {selectedStat ? selectedStat.toUpperCase() : ''} - {selectedPlayer?.nombre} {selectedPlayer?.apellido}
          </ModalHeader>
          <ModalBody>
            {selectedPlayer && selectedStat && (
              <Row>
                {/* Modal para Goles */}
                {selectedStat === 'goles' && (
                  <Col md="12">
                    <FormGroup>
                      <Label>Goles</Label>
                      <Input
                        type="number"
                        value={selectedPlayer.goles}
                        onChange={(e) => handleSimpleStatChange(e, 'goles')}
                      />
                    </FormGroup>
                  </Col>
                )}
                
                {/* Modal para Asistencias */}
                {selectedStat === 'asistencias' && (
                  <Col md="12">
                    <FormGroup>
                      <Label>Asistencias</Label>
                      <Input
                        type="number"
                        value={selectedPlayer.asistencias}
                        onChange={(e) => handleSimpleStatChange(e, 'asistencias')}
                      />
                    </FormGroup>
                  </Col>
                )}
                
                {/* Modal para Pases */}
                {selectedStat === 'pases' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Pases Completados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.pases.completados}
                          onChange={(e) => handlePasesChange(e, 'completados')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Pases Intentados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.pases.intentados}
                          onChange={(e) => handlePasesChange(e, 'intentados')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Efectividad: {selectedPlayer.pases.efectividad}%</h4>
                      </div>
                    </Col>
                  </>
                )}
                
                {/* Modal para Tiros */}
                {selectedStat === 'tiros' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Tiros al Arco</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.tiros.alArco}
                          onChange={(e) => handleTirosChange(e, 'alArco')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Tiros Totales</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.tiros.total}
                          onChange={(e) => handleTirosChange(e, 'total')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Precisión: {selectedPlayer.tiros.precision}%</h4>
                      </div>
                    </Col>
                  </>
                )}
                
                {/* Modal para Duelos */}
                {selectedStat === 'duelos' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duelos Ganados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.duelos.ganados}
                          onChange={(e) => handleDuelosChange(e, 'ganados')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duelos Totales</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.duelos.total}
                          onChange={(e) => handleDuelosChange(e, 'total')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Porcentaje: {selectedPlayer.duelos.porcentaje}%</h4>
                      </div>
                    </Col>
                  </>
                )}
                
                {/* Modal para Posesión */}
                {selectedStat === 'posesion' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Recuperaciones</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.posesion.recuperaciones}
                          onChange={(e) => handlePosesionChange(e, 'recuperaciones')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Pérdidas</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.posesion.perdidas}
                          onChange={(e) => handlePosesionChange(e, 'perdidas')}
                        />
                      </FormGroup>
                    </Col>
                  </>
                )}
                
                {/* Modal para Centros */}
                {selectedStat === 'centros' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Centros Completados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.centros.completados}
                          onChange={(e) => handleCentrosChange(e, 'completados')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Centros Intentados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.centros.intentados}
                          onChange={(e) => handleCentrosChange(e, 'intentados')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Precisión: {selectedPlayer.centros.precision}%</h4>
                      </div>
                    </Col>
                  </>
                )}
                
                {/* Modal para Defensa */}
                {selectedStat === 'defensa' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Intercepciones</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.intercepciones}
                          onChange={(e) => handleSimpleStatChange(e, 'intercepciones')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Bloqueos</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.bloqueos}
                          onChange={(e) => handleSimpleStatChange(e, 'bloqueos')}
                        />
                      </FormGroup>
                    </Col>
                  </>
                )}

                {/* Modal para Porcentaje de Paradas */}
                {selectedStat === 'porcentajeParadas' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Paradas realizadas</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.paradasRealizadas ?? ''}
                          onChange={(e) => setSelectedPlayer(prev => ({ ...prev, paradasRealizadas: e.target.value === '' ? null : parseInt(e.target.value) }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Tiros a portería</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.tirosAPorteria ?? ''}
                          onChange={(e) => setSelectedPlayer(prev => ({ ...prev, tirosAPorteria: e.target.value === '' ? null : parseInt(e.target.value) }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Porcentaje: {selectedPlayer.tirosAPorteria > 0 ? Math.round((selectedPlayer.paradasRealizadas / selectedPlayer.tirosAPorteria) * 100) : 0}%</h4>
                      </div>
                    </Col>
                  </>
                )}
                {/* Modal para Pases Exitosos (Portero) */}
                {selectedStat === 'pasesExitososPortero' && (
                  <Col md="12">
                    <FormGroup>
                      <Label>Pases Exitosos (Portero)</Label>
                      <Input
                        type="number"
                        value={selectedPlayer.pasesExitososPortero ?? ''}
                        onChange={(e) => setSelectedPlayer(prev => ({ ...prev, pasesExitososPortero: e.target.value === '' ? null : parseInt(e.target.value) }))}
                      />
                    </FormGroup>
                  </Col>
                )}
                {/* Modal para Duelos Mano a Mano Ganados */}
                {selectedStat === 'duelosManoAManoGanados' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duelos Mano a Mano Ganados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.duelosManoAManoGanados ?? ''}
                          onChange={(e) => setSelectedPlayer(prev => ({ ...prev, duelosManoAManoGanados: e.target.value === '' ? null : parseInt(e.target.value) }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duelos Mano a Mano Totales</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.duelosManoAManoTotales ?? ''}
                          onChange={(e) => setSelectedPlayer(prev => ({ ...prev, duelosManoAManoTotales: e.target.value === '' ? null : parseInt(e.target.value) }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Porcentaje: {selectedPlayer.duelosManoAManoTotales > 0 ? Math.round((selectedPlayer.duelosManoAManoGanados / selectedPlayer.duelosManoAManoTotales) * 100) : 0}%</h4>
                      </div>
                    </Col>
                  </>
                )}
                {/* Modal para Duelos Aéreos */}
                {selectedStat === 'duelosAereos' && (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duelos Aéreos Ganados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.duelosAereos?.ganados ?? ''}
                          onChange={(e) => setSelectedPlayer(prev => ({
                            ...prev,
                            duelosAereos: {
                              ...prev.duelosAereos,
                              ganados: e.target.value === '' ? null : parseInt(e.target.value)
                            }
                          }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duelos Aéreos Totales</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.duelosAereos?.total ?? ''}
                          onChange={(e) => setSelectedPlayer(prev => ({
                            ...prev,
                            duelosAereos: {
                              ...prev.duelosAereos,
                              total: e.target.value === '' ? null : parseInt(e.target.value)
                            }
                          }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12">
                      <div className="text-center mt-3">
                        <h4>Porcentaje: {selectedPlayer.duelosAereos?.total > 0 ? Math.round((selectedPlayer.duelosAereos.ganados / selectedPlayer.duelosAereos.total) * 100) : 0}%</h4>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            )}
            {errorModal && (
              <Row>
                <Col md="12">
                  <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                    {errorModal}
                  </div>
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSaveStats}>
              Guardar
            </Button>
            <Button color="secondary" onClick={() => setModalOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal de confirmación para eliminar sesión */}
        <Modal
          isOpen={modalConfirmacionOpen}
          toggle={() => setModalConfirmacionOpen(false)}
          className="modal-dialog-centered"
        >
          <ModalHeader toggle={() => setModalConfirmacionOpen(false)}>
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            ¿Está seguro de que desea eliminar esta sesión?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={eliminarSesion}>
              Eliminar
            </Button>
            <Button color="secondary" onClick={() => setModalConfirmacionOpen(false)}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </>
  );
};

export default Sesiones;