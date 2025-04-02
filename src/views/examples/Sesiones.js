/*!
=========================================================
* Sesiones Component - v2.0
* Estadísticas Avanzadas de Fútbol
=========================================================
*/
import React, { useState } from "react";
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
  const [sesiones, setSesiones] = useState([
    {
      id: 1,
      titulo: "Sesión Ofensiva Avanzada",
      tipo: "ofensiva",
      jugadores: Object.keys(jugadoresReclutados).map(cedula => ({
        cedula,
        nombre: jugadoresReclutados[cedula].nombre,
        apellido: jugadoresReclutados[cedula].apellido,
        // Estadísticas básicas
        goles: 0,
        asistencias: 0,
        // Estadísticas avanzadas
        pases: { completados: 0, intentados: 0, efectividad: 0 },
        tiros: { alArco: 0, total: 0, precision: 0, xG: 0 },
        duelos: { ganados: 0, total: 0, porcentaje: 0 },
        posesion: { recuperaciones: 0, perdidas: 0 },
        centros: { completados: 0, intentados: 0, precision: 0 },
        intercepciones: 0,
        bloqueos: 0
      }))
    }
  ]);
  const [editandoTitulo, setEditandoTitulo] = useState(null);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoTipoSesion, setNuevoTipoSesion] = useState("ofensiva");

  // Abre el modal para editar una estadística específica
  const handleStatClick = (sesionId, jugador, statName) => {
    setSelectedPlayer({ ...jugador, sesionId });
    setSelectedStat(statName);
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

  // Guarda los datos de la estadística editada
  const handleSaveStats = () => {
    setSesiones(prevSesiones =>
      prevSesiones.map(sesion =>
        sesion.id === selectedPlayer.sesionId
          ? {
              ...sesion,
              jugadores: sesion.jugadores.map(j =>
                j.cedula === selectedPlayer.cedula ? selectedPlayer : j
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
    const value = parseInt(e.target.value) || 0;
    setSelectedPlayer(prev => {
      const newPases = { ...prev.pases, [field]: value };
      return {
        ...prev,
        pases: {
          ...newPases,
          efectividad: calcularEfectividadPases(newPases.completados, newPases.intentados)
        }
      };
    });
  };

  const handleTirosChange = (e, field) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedPlayer(prev => {
      const newTiros = { ...prev.tiros, [field]: value };
      const { precision, xG } = calcularPrecisionTiros(newTiros.alArco, newTiros.total);
      return {
        ...prev,
        tiros: {
          ...newTiros,
          precision,
          xG
        }
      };
    });
  };

  const handleDuelosChange = (e, field) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedPlayer(prev => {
      const newDuelos = { ...prev.duelos, [field]: value };
      return {
        ...prev,
        duelos: {
          ...newDuelos,
          porcentaje: calcularPorcentajeDuelos(newDuelos.ganados, newDuelos.total)
        }
      };
    });
  };

  const handleCentrosChange = (e, field) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedPlayer(prev => {
      const newCentros = { ...prev.centros, [field]: value };
      return {
        ...prev,
        centros: {
          ...newCentros,
          precision: calcularPrecisionCentros(newCentros.completados, newCentros.intentados)
        }
      };
    });
  };

  const handleSimpleStatChange = (e, statName) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedPlayer(prev => ({
      ...prev,
      [statName]: value
    }));
  };

  const handlePosesionChange = (e, field) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedPlayer(prev => ({
      ...prev,
      posesion: {
        ...prev.posesion,
        [field]: value
      }
    }));
  };

  const iniciarEdicionTitulo = (sesionId, tituloActual) => {
    setEditandoTitulo(sesionId);
    setNuevoTitulo(tituloActual);
  };
  
  const guardarTitulo = (sesionId) => {
    setSesiones(prevSesiones =>
      prevSesiones.map(sesion =>
        sesion.id === sesionId ? { ...sesion, titulo: nuevoTitulo } : sesion
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
                        <Input
                          type="text"
                          value={nuevoTitulo}
                          onChange={(e) => setNuevoTitulo(e.target.value)}
                          onBlur={() => guardarTitulo(sesion.id)}
                          autoFocus
                        />
                      ) : (
                        <h3 className="mb-0" onClick={() => iniciarEdicionTitulo(sesion.id, sesion.titulo)}>
                          {sesion.titulo}
                        </h3>
                      )}
                    </Col>
                    <Col className="text-right">
                      <Button
                        color="success"
                        size="sm"
                        onClick={() => iniciarEdicionTitulo(sesion.id, sesion.titulo)}
                        className="mr-2"
                      >
                        Cambiar Título
                      </Button>
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
                      <th scope="col">Goles</th>
                      <th scope="col">Asistencias</th>
                      <th scope="col">Efectividad de Pases</th>
                      <th scope="col">Precisión de Tiros (xG)</th>
                      <th scope="col">Duelos Ganados</th>
                      <th scope="col">Posesión (R/P)</th>
                      <th scope="col">Centros</th>
                      <th scope="col">Intercepciones/Bloqueos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sesion.jugadores.map(jugador => (
                      <tr key={jugador.cedula}>
                        <td>{`${jugador.nombre} ${jugador.apellido}`}</td>
                        
                        {/* Goles */}
                        <td>
                          <Badge 
                            color="success" 
                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'goles')}
                          >
                            {jugador.goles}
                          </Badge>
                        </td>
                        
                        {/* Asistencias */}
                        <td>
                          <Badge 
                            color="info" 
                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'asistencias')}
                          >
                            {jugador.asistencias}
                          </Badge>
                        </td>
                        
                        {/* Efectividad de Pases */}
                        <td>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'pases')}
                          >
                            <Progress
                              value={jugador.pases.efectividad}
                              color={jugador.pases.efectividad > 80 ? 'success' : 
                                    jugador.pases.efectividad > 60 ? 'info' : 'warning'}
                            >
                              {jugador.pases.efectividad}%
                            </Progress>
                            <small>{jugador.pases.completados}/{jugador.pases.intentados}</small>
                          </div>
                        </td>
                        
                        {/* Precisión de Tiros */}
                        <td>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'tiros')}
                          >
                            <Progress
                              value={jugador.tiros.precision}
                              color={jugador.tiros.precision > 50 ? 'success' : 
                                    jugador.tiros.precision > 30 ? 'info' : 'warning'}
                            >
                              {jugador.tiros.precision}%
                            </Progress>
                            <small>xG: {jugador.tiros.xG} | {jugador.tiros.alArco}/{jugador.tiros.total}</small>
                          </div>
                        </td>
                        
                        {/* Duelos Ganados */}
                        <td>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'duelos')}
                          >
                            <Progress
                              value={jugador.duelos.porcentaje}
                              color={jugador.duelos.porcentaje > 60 ? 'success' : 
                                    jugador.duelos.porcentaje > 40 ? 'info' : 'warning'}
                            >
                              {jugador.duelos.porcentaje}%
                            </Progress>
                            <small>{jugador.duelos.ganados}/{jugador.duelos.total}</small>
                          </div>
                        </td>
                        
                        {/* Recuperaciones/Pérdidas */}
                        <td>
                          <Badge 
                            color="primary" 
                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'posesion')}
                          >
                            {jugador.posesion.recuperaciones}/{jugador.posesion.perdidas}
                          </Badge>
                        </td>
                        
                        {/* Centros */}
                        <td>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'centros')}
                          >
                            <Progress
                              value={jugador.centros.precision}
                              color={jugador.centros.precision > 40 ? 'success' : 
                                    jugador.centros.precision > 20 ? 'info' : 'warning'}
                            >
                              {jugador.centros.precision}%
                            </Progress>
                            <small>{jugador.centros.completados}/{jugador.centros.intentados}</small>
                          </div>
                        </td>
                        
                        {/* Intercepciones/Bloqueos */}
                        <td>
                          <Badge 
                            color="danger" 
                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => handleStatClick(sesion.id, jugador, 'defensa')}
                          >
                            {jugador.intercepciones}/{jugador.bloqueos}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        ))}

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
                        <h4>Goles Esperados (xG): {selectedPlayer.tiros.xG}</h4>
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

        {/* Resto de los modales y componentes permanecen igual */}
        {/* ... */}
      </Container>
    </>
  );
};

export default Sesiones;