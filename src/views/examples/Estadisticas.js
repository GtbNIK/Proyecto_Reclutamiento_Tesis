import React, { useState } from "react";
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

const Estadisticas = () => {
  const { jugadoresReclutados } = useJugadores();
  const sesiones = JSON.parse(localStorage.getItem('sesionesEntrenamiento')) || [];
  const { jugadoresCampo, porteros } = consolidarEstadisticasPorJugador(sesiones, jugadoresReclutados);

  // Obtener lista de jugadores de campo para el dropdown
  const jugadoresCampoList = Object.values(jugadoresReclutados).filter(j => j.posicion && !j.posicion.toLowerCase().includes('portero'));
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(jugadoresCampoList[0]?.cedula || '');

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
                <div style={{ minHeight: 320 }}>
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
                  <div style={{ minHeight: 345 }}>
                    <Radar data={dataRadar} options={optionsRadar} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Estadisticas;
