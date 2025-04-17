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
        bloqueos: 0
      }))
    }
  ]);
  const [editandoTitulo, setEditandoTitulo] = useState(null);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoTipoSesion, setNuevoTipoSesion] = useState("ofensiva");
  const [nuevaFecha, setNuevaFecha] = useState(""); // Estado para la nueva fecha

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
    const errores = validarEstadisticas(selectedPlayer);
    
    if (errores.length > 0) {
      alert(errores.join('\n'));
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
    const nuevaSesion = {
      id: sesiones.length + 1, // Asigna un nuevo ID
      titulo: `Sesión ${sesiones.length + 1}`, // Título por defecto
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
    };

    setSesiones(prevSesiones => [...prevSesiones, nuevaSesion]);
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
                          color="success"
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
                              style={{ height: '23px' }}
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
                              style={{ height: '23px' }}
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
                              style={{ height: '23px' }}
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
                              style={{ height: '23px' }}
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

        {/* Botón para agregar nueva sesión */}
        <Row>
          <Col className="text-center">
            <Button color="primary" onClick={agregarNuevaSesion}>
              Agregar Nueva Sesión
            </Button>
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