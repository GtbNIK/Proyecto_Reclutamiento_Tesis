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

const Estadisticas = () => {
  const { jugadoresReclutados } = useJugadores();
  const sesiones = JSON.parse(localStorage.getItem('sesionesEntrenamiento')) || [];
  const { jugadoresCampo, porteros } = consolidarEstadisticasPorJugador(sesiones, jugadoresReclutados);

  return (
    <Container className="mt-5" fluid>
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
                <th>Centros Completados (T/P)</th>
                <th>Centros Intentados (T/P)</th>
                <th>% Precisión Centros</th>
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
                  <td>{j.centrosCompletados} / {j.promedioCentrosCompletados}</td>
                  <td>{j.centrosIntentados} / {j.promedioCentrosIntentados}</td>
                  <td>{j.precisionCentros}%</td>
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
                <th>Posición</th>
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
                  <td>{j.posicion}</td>
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
    </Container>
  );
};

export default Estadisticas;
