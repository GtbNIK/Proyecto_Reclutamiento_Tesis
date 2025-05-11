import React, { useState, useRef } from "react";
import { 
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Col,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Label
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { useJugadores } from "../../context/JugadoresContext";
import { consolidarEstadisticasPorJugador } from "../../utils/estadisticas";
import { Line } from 'react-chartjs-2';
import { Radar } from 'react-chartjs-2';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Estadisticas = () => {
  const { jugadoresReclutados } = useJugadores();
  const sesiones = JSON.parse(localStorage.getItem('sesionesEntrenamiento')) || [];
  const { jugadoresCampo, porteros } = consolidarEstadisticasPorJugador(sesiones, jugadoresReclutados);

  // Obtener lista de jugadores de campo para el dropdown
  const jugadoresCampoList = Object.values(jugadoresReclutados).filter(j => j.posicion && !j.posicion.toLowerCase().includes('portero'));
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(jugadoresCampoList[0]?.cedula || '');
  const [jugadorSeleccionadoPDF, setJugadorSeleccionadoPDF] = useState(jugadoresCampoList[0]?.cedula || ''); // Nueva variable para el select del PDF

  // Construir datos para la gráfica de líneas
  const metricas = [
    { key: 'goles', label: 'Goles' },
    { key: 'asistencias', label: 'Asistencias' },
    { key: 'bloqueos', label: 'Bloqueos' },
    { key: 'intercepciones', label: 'Intercepciones' },
    { key: 'recuperaciones', label: 'Recuperaciones' },
    { key: 'perdidas', label: 'Pérdidas' },
  ];

  // Extraer los datos de cada sesión para el jugador seleccionado
  const datosPorSesion = sesiones.map((sesion, idx) => {
    const jugador = sesion.jugadores.find(j => j.cedula === jugadorSeleccionado);
    return {
      sesion: idx + 1,
      goles: jugador?.goles ?? 0,
      asistencias: jugador?.asistencias ?? 0,
      bloqueos: jugador?.bloqueos ?? 0,
      intercepciones: jugador?.intercepciones ?? 0,
      recuperaciones: jugador?.posesion?.recuperaciones ?? 0,
      perdidas: jugador?.posesion?.perdidas ?? 0,
    };
  });

  const dataLine = {
    labels: datosPorSesion.map(d => `Sesión ${d.sesion}`),
    datasets: metricas.map((metrica, i) => ({
      label: metrica.label,
      data: datosPorSesion.map(d => d[metrica.key]),
      borderColor: [
        '#01920D', // Goles
        '#2dce89', // Asistencias
        '#f5365c', // Bloqueos
        '#5e72e4', // Intercepciones
        '#fb6340', // Recuperaciones
        '#11cdef', // Pérdidas
      ][i],
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 3,
      pointRadius: 4,
      fill: false,
      tension: 0.2,
    }))
  };

  const optionsLine = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Evolución del Jugador en las Sesiones' },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Para la gráfica radar: métricas de porcentaje
  const metricasRadar = [
    { key: 'porcentajeDuelos', label: '% Duelos Ganados' },
    { key: 'porcentajeDuelosAereos', label: '% Duelos Aéreos Ganados' },
    { key: 'precisionTiros', label: '% Precisión de Tiros' },
    { key: 'efectividadPases', label: '% Efectividad de Pases' },
  ];

  // Dropdowns para dos jugadores
  const [jugadorRadar1, setJugadorRadar1] = useState(jugadoresCampoList[0]?.cedula || '');
  const [jugadorRadar2, setJugadorRadar2] = useState(jugadoresCampoList[1]?.cedula || '');

  // Buscar los datos consolidados de cada jugador
  const getStatsRadar = (cedula) => {
    const jugador = jugadoresCampo.find(j => j.cedula === cedula);
    return {
      porcentajeDuelos: jugador?.porcentajeDuelos ?? 0,
      porcentajeDuelosAereos: jugador?.duelosTotales > 0 ? Math.round((jugador?.duelosGanados / jugador?.duelosTotales) * 100) : 0,
      precisionTiros: jugador?.precisionTiros ?? 0,
      efectividadPases: jugador?.efectividadPases ?? 0,
    };
  };

  const stats1 = getStatsRadar(jugadorRadar1);
  const stats2 = getStatsRadar(jugadorRadar2);

  const dataRadar = {
    labels: metricasRadar.map(m => m.label),
    datasets: [
      jugadorRadar1 && {
        label: jugadoresCampoList.find(j => j.cedula === jugadorRadar1)?.nombre + ' ' + jugadoresCampoList.find(j => j.cedula === jugadorRadar1)?.apellido,
        data: metricasRadar.map(m => stats1[m.key]),
        backgroundColor: 'rgba(1,146,13,0.2)',
        borderColor: '#01920D',
        pointBackgroundColor: '#01920D',
        borderWidth: 3,
      },
      jugadorRadar2 && {
        label: jugadoresCampoList.find(j => j.cedula === jugadorRadar2)?.nombre + ' ' + jugadoresCampoList.find(j => j.cedula === jugadorRadar2)?.apellido,
        data: metricasRadar.map(m => stats2[m.key]),
        backgroundColor: 'rgba(94,114,228,0.2)',
        borderColor: '#5e72e4',
        pointBackgroundColor: '#5e72e4',
        borderWidth: 3,
      }
    ].filter(Boolean)
  };

  const optionsRadar = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Perfil de Rendimiento (Radar)' },
    },
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        pointLabels: { font: { size: 14 } }
      }
    }
  };

  // Función para obtener estadísticas acumuladas y promedios del jugador desde las sesiones
  const getEstadisticasJugador = (cedula) => {
    // Filtrar todas las sesiones donde el jugador participó
    const sesionesJugador = sesiones.filter(s => s.jugadores.some(j => j.cedula === cedula));
    if (sesionesJugador.length === 0) return null;
    let totales = {
      goles: 0,
      asistencias: 0,
      duelosGanados: 0,
      duelosTotales: 0,
      pasesCompletados: 0,
      pasesIntentados: 0,
      tirosAlArco: 0,
      tirosTotales: 0,
      recuperaciones: 0,
      perdidas: 0,
      intercepciones: 0,
      bloqueos: 0,
      porcentajeDuelos: 0,
      efectividadPases: 0,
      precisionTiros: 0,
      efectividadTiros: 0,
      porcentajeParadas: 0,
      paradasRealizadas: 0,
      tirosAPorteria: 0,
      golesConcedidos: 0,
      pasesExitososPortero: 0,
      duelosManoAManoGanados: 0,
      duelosManoAManoTotales: 0,
      porcentajeDuelosManoAMano: 0,
      duelosAereosGanados: 0,
      duelosAereosTotales: 0,
      porcentajeDuelosAereos: 0
    };
    sesionesJugador.forEach(sesion => {
      const jugador = sesion.jugadores.find(j => j.cedula === cedula);
      if (!jugador) return;
      totales.goles += jugador.goles || 0;
      totales.asistencias += jugador.asistencias || 0;
      totales.duelosGanados += jugador.duelos?.ganados || 0;
      totales.duelosTotales += jugador.duelos?.total || 0;
      totales.pasesCompletados += jugador.pases?.completados || 0;
      totales.pasesIntentados += jugador.pases?.intentados || 0;
      totales.tirosAlArco += jugador.tiros?.alArco || 0;
      totales.tirosTotales += jugador.tiros?.total || 0;
      totales.recuperaciones += jugador.posesion?.recuperaciones || 0;
      totales.perdidas += jugador.posesion?.perdidas || 0;
      totales.intercepciones += jugador.intercepciones || 0;
      totales.bloqueos += jugador.bloqueos || 0;
      totales.paradasRealizadas += jugador.paradasRealizadas || 0;
      totales.tirosAPorteria += jugador.tirosAPorteria || 0;
      totales.pasesExitososPortero += jugador.pasesExitososPortero || 0;
      totales.duelosManoAManoGanados += jugador.duelosManoAManoGanados || 0;
      totales.duelosManoAManoTotales += jugador.duelosManoAManoTotales || 0;
      totales.duelosAereosGanados += jugador.duelosAereos?.ganados || 0;
      totales.duelosAereosTotales += jugador.duelosAereos?.total || 0;
    });
    const sesionesCount = sesionesJugador.length;
    // Cálculos de porcentajes y promedios
    totales.porcentajeDuelos = totales.duelosTotales > 0 ? Math.round((totales.duelosGanados / totales.duelosTotales) * 100) : 0;
    totales.efectividadPases = totales.pasesIntentados > 0 ? Math.round((totales.pasesCompletados / totales.pasesIntentados) * 100) : 0;
    totales.precisionTiros = totales.tirosTotales > 0 ? Math.round((totales.tirosAlArco / totales.tirosTotales) * 100) : 0;
    totales.efectividadTiros = totales.tirosTotales > 0 ? Math.round((totales.tirosAlArco / totales.tirosTotales) * 100) : 0;
    totales.golesConcedidos = totales.tirosAPorteria - totales.paradasRealizadas;
    totales.porcentajeParadas = totales.tirosAPorteria > 0 ? Math.round((totales.paradasRealizadas / totales.tirosAPorteria) * 100) : 0;
    totales.porcentajeDuelosManoAMano = totales.duelosManoAManoTotales > 0 ? Math.round((totales.duelosManoAManoGanados / totales.duelosManoAManoTotales) * 100) : 0;
    totales.porcentajeDuelosAereos = totales.duelosAereosTotales > 0 ? Math.round((totales.duelosAereosGanados / totales.duelosAereosTotales) * 100) : 0;
    // Promedios
    const promedios = {
      goles: (totales.goles / sesionesCount).toFixed(2),
      asistencias: (totales.asistencias / sesionesCount).toFixed(2),
      duelosGanados: (totales.duelosGanados / sesionesCount).toFixed(2),
      duelosTotales: (totales.duelosTotales / sesionesCount).toFixed(2),
      pasesCompletados: (totales.pasesCompletados / sesionesCount).toFixed(2),
      pasesIntentados: (totales.pasesIntentados / sesionesCount).toFixed(2),
      tirosAlArco: (totales.tirosAlArco / sesionesCount).toFixed(2),
      tirosTotales: (totales.tirosTotales / sesionesCount).toFixed(2),
      recuperaciones: (totales.recuperaciones / sesionesCount).toFixed(2),
      perdidas: (totales.perdidas / sesionesCount).toFixed(2),
      intercepciones: (totales.intercepciones / sesionesCount).toFixed(2),
      bloqueos: (totales.bloqueos / sesionesCount).toFixed(2),
      paradasRealizadas: (totales.paradasRealizadas / sesionesCount).toFixed(2),
      tirosAPorteria: (totales.tirosAPorteria / sesionesCount).toFixed(2),
      golesConcedidos: (totales.golesConcedidos / sesionesCount).toFixed(2),
      pasesExitososPortero: (totales.pasesExitososPortero / sesionesCount).toFixed(2),
      duelosManoAManoGanados: (totales.duelosManoAManoGanados / sesionesCount).toFixed(2),
      duelosManoAManoTotales: (totales.duelosManoAManoTotales / sesionesCount).toFixed(2),
      duelosAereosGanados: (totales.duelosAereosGanados / sesionesCount).toFixed(2),
      duelosAereosTotales: (totales.duelosAereosTotales / sesionesCount).toFixed(2)
    };
    return { totales, promedios, sesionesCount };
  };

  const lineChartRef = useRef(null);
  const radarChartRef = useRef(null);

  // Función para emitir PDF de estadísticas del jugador seleccionado
  const handleEmitirPDF = async () => {
    const jugador = jugadoresCampoList.find(j => j.cedula === jugadorSeleccionadoPDF);
    if (!jugador) return;
    const estadisticas = getEstadisticasJugador(jugador.cedula);
    if (!estadisticas) return;
    const { totales, promedios, sesionesCount } = estadisticas;
    const doc = new jsPDF();
    let y = 20;
    // Encabezado con fondo
    doc.setFillColor(1, 146, 13); // Verde oscuro
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Reporte de Estadísticas del Jugador", 105, 16, { align: "center" });
    doc.setFontSize(12);
    doc.text("Sistema de Reclutamiento de Futbolistas", 105, 23, { align: "center" });
    doc.setTextColor(0, 0, 0);
    y = 32;
    // Datos personales
    doc.setFontSize(14);
    doc.text("Datos del Jugador", 15, y);
    doc.setDrawColor(44, 206, 137); // Verde claro
    doc.line(15, y + 2, 195, y + 2);
    y += 8;
    doc.text(`Nombre: ${jugador.nombre} ${jugador.apellido}`, 20, y);
    y += 7;
    doc.text(`Cédula: ${jugador.cedula}`, 20, y);
    y += 7;
    doc.text(`Posición: ${jugador.posicion}`, 20, y);
    y += 7;
    doc.text(`Sesiones jugadas: ${sesionesCount}`, 20, y);
    y += 10;
    // Sección de estadísticas
    doc.setFontSize(14);
    doc.text("Estadísticas Totales (T) / Promedio (P)", 15, y);
    doc.setDrawColor(44, 206, 137);
    doc.line(15, y + 2, 195, y + 2);
    y += 8;
    doc.setFontSize(12);
    const stats = [
      [`Goles (T/P)`, `${totales.goles} / ${promedios.goles}`],
      [`Asistencias (T/P)`, `${totales.asistencias} / ${promedios.asistencias}`],
      [`Duelos Ganados (T/P)`, `${totales.duelosGanados} / ${promedios.duelosGanados}`],
      [`Duelos Totales (T/P)`, `${totales.duelosTotales} / ${promedios.duelosTotales}`],
      [`% Duelos`, `${totales.porcentajeDuelos}%`],
      [`Pases Completados (T/P)`, `${totales.pasesCompletados} / ${promedios.pasesCompletados}`],
      [`Pases Intentados (T/P)`, `${totales.pasesIntentados} / ${promedios.pasesIntentados}`],
      [`% Efectividad Pases`, `${totales.efectividadPases}%`],
      [`Tiros al Arco (T/P)`, `${totales.tirosAlArco} / ${promedios.tirosAlArco}`],
      [`Tiros Totales (T/P)`, `${totales.tirosTotales} / ${promedios.tirosTotales}`],
      [`% Precisión Tiros`, `${totales.precisionTiros}%`],
      [`Recuperaciones (T/P)`, `${totales.recuperaciones} / ${promedios.recuperaciones}`],
      [`Pérdidas (T/P)`, `${totales.perdidas} / ${promedios.perdidas}`],
      [`Intercepciones (T/P)`, `${totales.intercepciones} / ${promedios.intercepciones}`],
      [`Bloqueos (T/P)`, `${totales.bloqueos} / ${promedios.bloqueos}`],
      [`Paradas Realizadas (T/P)`, `${totales.paradasRealizadas} / ${promedios.paradasRealizadas}`],
      [`Tiros a Portería (T/P)`, `${totales.tirosAPorteria} / ${promedios.tirosAPorteria}`],
      [`Goles Concedidos (T/P)`, `${totales.golesConcedidos} / ${promedios.golesConcedidos}`],
      [`Pases Exitosos Portero (T/P)`, `${totales.pasesExitososPortero} / ${promedios.pasesExitososPortero}`],
      [`Duelos Mano a Mano Ganados (T/P)`, `${totales.duelosManoAManoGanados} / ${promedios.duelosManoAManoGanados}`],
      [`Duelos Mano a Mano Totales (T/P)`, `${totales.duelosManoAManoTotales} / ${promedios.duelosManoAManoTotales}`],
      [`% Duelos Mano a Mano`, `${totales.porcentajeDuelosManoAMano}%`],
      [`Duelos Aéreos Ganados (T/P)`, `${totales.duelosAereosGanados} / ${promedios.duelosAereosGanados}`],
      [`Duelos Aéreos Totales (T/P)`, `${totales.duelosAereosTotales} / ${promedios.duelosAereosTotales}`],
      [`% Duelos Aéreos`, `${totales.porcentajeDuelosAereos}%`],
    ];
    stats.forEach(([label, value]) => {
      doc.setFont(undefined, 'normal');
      doc.text(`${label}: ${value}`, 20, y);
      y += 7;
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
    });
    // Gráficas
    if (lineChartRef.current) {
      const canvas = await html2canvas(lineChartRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(1, 146, 13);
      doc.text('Evolución del Jugador', 105, y + 10, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      y += 15;
      doc.addImage(imgData, 'PNG', 15, y, 180, 60);
      y += 65;
    }
    if (radarChartRef.current) {
      const canvas = await html2canvas(radarChartRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(1, 146, 13);
      doc.text('Comparativa Radar', 105, y + 10, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      y += 15;
      doc.addImage(imgData, 'PNG', 15, y, 180, 60);
      y += 65;
    }
    // Pie de página
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Emitido por el Sistema de Reclutamiento de Futbolistas - ${fecha}`, 105, 290, { align: 'center' });
    doc.save(`estadisticas_${jugador.nombre}_${jugador.apellido}.pdf`);
  };

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
        <h2 className="mb-4">Estadísticas Totales y Promedio de las Sesiones</h2>
        {/* Tabla de Jugadores de Campo */}
        <Card className="mb-5">
          <CardHeader>
            <h3 className="mb-0">Jugadores de Campo(Del, MC, Def)</h3>
          </CardHeader>
          <CardBody>
            <Table className="align-items-center table-flush" responsive>
              <thead className="thead-light">
                <tr>
                  <th>Nombre</th>
                  <th>Posición</th>
                  <th>Sesiones</th>
                  <th>Goles (T/P)</th>
                  <th>Asistencias (T/P)</th>
                  <th>Duelos Ganados (T/P)</th>
                  <th>% Duelos</th>
                  <th>Pases Completados (T/P)</th>
                  <th>Pases Intentados (T/P)</th>
                  <th>% Efectividad Pases</th>
                  <th>Tiros al Arco (T/P)</th>
                  <th>Tiros Totales (T/P)</th>
                  <th>% Precisión Tiros</th>
                  <th>Recuperaciones (T/P)</th>
                  <th>Pérdidas (T/P)</th>
                  <th>Intercepciones (T/P)</th>
                  <th>Bloqueos (T/P)</th>
                </tr>
              </thead>
              <tbody>
                {jugadoresCampo.length > 0 ? jugadoresCampo.map(j => (
                  <tr key={j.cedula}>
                    <td>{j.nombre} {j.apellido}</td>
                    <td>{j.posicion}</td>
                    <td>{j.sesiones}</td>
                    <td>{j.goles} / {j.promedioGoles}</td>
                    <td>{j.asistencias} / {j.promedioAsistencias}</td>
                    <td>{j.duelosGanados} / {j.promedioDuelosGanados}</td>
                    <td>{j.porcentajeDuelos}%</td>
                    <td>{j.pasesCompletados} / {j.promedioPasesCompletados}</td>
                    <td>{j.pasesIntentados} / {j.promedioPasesIntentados}</td>
                    <td>{j.efectividadPases}%</td>
                    <td>{j.tirosAlArco} / {j.promedioTirosAlArco}</td>
                    <td>{j.tirosTotales} / {j.promedioTirosTotales}</td>
                    <td>{j.precisionTiros}%</td>
                    <td>{j.recuperaciones} / {j.promedioRecuperaciones}</td>
                    <td>{j.perdidas} / {j.promedioPerdidas}</td>
                    <td>{j.intercepciones} / {j.promedioIntercepciones}</td>
                    <td>{j.bloqueos} / {j.promedioBloqueos}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="20" className="text-center py-4">
                      <span className="text-muted">Aún no hay datos de jugadores de campo</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Tabla de Porteros */}
        <Card>
          <CardHeader>
            <h3 className="mb-0">Porteros</h3>
          </CardHeader>
          <CardBody>
            <Table className="align-items-center table-flush" responsive>
              <thead className="thead-light">
                <tr>
                  <th>Nombre</th>
                  <th>Sesiones</th>
                  <th>Paradas (T/P)</th>
                  <th>Tiros a Portería (T/P)</th>
                  <th>% Paradas</th>
                  <th>Goles Concedidos (T/P)</th>
                  <th>Pases Exitosos (T/P)</th>
                  <th>Duelos Mano a Mano Ganados (T/P)</th>
                  <th>Duelos Mano a Mano Totales (T/P)</th>
                  <th>% Duelos Mano a Mano</th>
                </tr>
              </thead>
              <tbody>
                {porteros.length > 0 ? porteros.map(j => (
                  <tr key={j.cedula}>
                    <td>{j.nombre} {j.apellido}</td>
                    <td>{j.sesiones}</td>
                    <td>{j.paradasRealizadas} / {j.promedioParadas}</td>
                    <td>{j.tirosAPorteria} / {j.promedioTirosAPorteria}</td>
                    <td>{j.porcentajeParadas}%</td>
                    <td>{j.golesConcedidos} / {j.promedioGolesConcedidos}</td>
                    <td>{j.pasesExitososPortero} / {j.promedioPasesExitosos}</td>
                    <td>{j.duelosManoAManoGanados} / {j.promedioDuelosManoAManoGanados}</td>
                    <td>{j.duelosManoAManoTotales} / {j.promedioDuelosManoAManoTotales}</td>
                    <td>{j.porcentajeDuelosManoAMano}%</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="11" className="text-center py-4">
                      <span className="text-muted">Aún no hay datos de porteros</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
        {/* Gráficas de evolución y radar en la misma fila */}
        <Row className="mt-5 mb-5">
          <Col md="6">
            <Card className="shadow">
              {/* Gráfica de evolución del jugador */}
              <CardHeader>
                <Row className="align-items-center">
                  <Col md="12">
                    <h3 className="mb-0">Evolución de un Jugador a lo largo de las sesiones</h3>
                    <p className="mb-0">Seleccione un jugador para medir su consistencia a lo largo del tiempo de reclutamiento</p>
                    <div style={{ height: '3px', width: '100%', background: '#01920D', borderRadius: '2px', margin: '7px 0px 7px 0px' }} />
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label>Selecciona un jugador</Label>
                      <Input
                        type="select"
                        value={jugadorSeleccionado}
                        onChange={e => setJugadorSeleccionado(e.target.value)}
                      >
                        {jugadoresCampoList.map(j => (
                          <option key={j.cedula} value={j.cedula}>
                            {j.nombre} {j.apellido}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div style={{ minHeight: 320 }} ref={lineChartRef}>
                  <Line data={dataLine} options={optionsLine} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md="6">
            <Card className="shadow">
              {/* Gráfica radar de comparación */}
              <CardHeader>
                <Row className="align-items-center">
                  <Col md="12">
                    <h3 className="mb-0">Comparativa Radar</h3>
                    <p className="mb-0">Seleccione dos jugadores para comparar sus estadísticas entre sí</p>
                    <div style={{ height: '3px', width: '100%', background: '#01920D', borderRadius: '2px', margin: '7px 0px 7px 0px' }} />
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Jugador 1</Label>
                      <Input
                        type="select"
                        value={jugadorRadar1}
                        onChange={e => setJugadorRadar1(e.target.value)}
                      >
                        <option value="">Selecciona un jugador</option>
                        {jugadoresCampoList
                          .filter(j => j.cedula !== jugadorRadar2)
                          .map(j => (
                            <option key={j.cedula} value={j.cedula}>
                              {j.nombre} {j.apellido}
                            </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label>Jugador 2</Label>
                      <Input
                        type="select"
                        value={jugadorRadar2}
                        onChange={e => setJugadorRadar2(e.target.value)}
                      >
                        <option value="">Selecciona un jugador</option>
                        {jugadoresCampoList
                          .filter(j => j.cedula !== jugadorRadar1)
                          .map(j => (
                            <option key={j.cedula} value={j.cedula}>
                              {j.nombre} {j.apellido}
                            </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {jugadoresCampoList.length < 2 ? (
                  <div className="text-center text-muted py-5">
                    <h4>Agrega al menos dos jugadores para comparar en el radar.</h4>
                  </div>
                ) : (
                  <div style={{ minHeight: 345 }} ref={radarChartRef}>
                    <Radar data={dataRadar} options={optionsRadar} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      {/* Nueva sección para emitir registros finales del jugador */}
      <Row className="mt-5 mb-5">
          <Col md="12">
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col md="12">
                    <h3 className="mb-0">Emitir Registros Finales de Jugador</h3>
                    <p className="mb-0">Seleccione un jugador para generar un PDF con sus estadísticas finales</p>
                    <div style={{ height: '3px', width: '100%', background: '#01920D', borderRadius: '2px', margin: '7px 0px 7px 0px' }} />
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row className="align-items-center">
                  <Col md="6">
                    <FormGroup>
                      <Label>Selecciona un jugador</Label>
                      <Input
                        type="select"
                        value={jugadorSeleccionadoPDF}
                        onChange={e => setJugadorSeleccionadoPDF(e.target.value)}
                      >
                        {jugadoresCampoList.map(j => (
                          <option key={j.cedula} value={j.cedula}>
                            {j.nombre} {j.apellido}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <Button 
                    style={{ width: '100%', marginTop: '8px',  backgroundColor: '#01920D', borderColor: '#01920D', color: 'white' }}
                    onClick={handleEmitirPDF}
                    >
                      Emitir PDF
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Estadisticas;
