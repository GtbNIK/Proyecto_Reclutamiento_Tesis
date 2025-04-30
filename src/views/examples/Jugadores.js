/*!
=========================================================
* Jugadores Component - v1.0
=========================================================
* Sistema de Gestión de Jugadores Reclutados
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
import { useJugadores } from "../../context/JugadoresContext"; // Importamos el hook del contexto

const Jugadores = () => {
  const { jugadoresReclutados, setJugadoresReclutados } = useJugadores(); // Obtenemos los jugadores del contexto
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [jugadorAEliminar, setJugadorAEliminar] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Sincronizar contexto con el backend
  useEffect(() => {
    fetch('http://localhost:5000/api/jugadores')
      .then(res => res.json())
      .then(data => {
        // Solo jugadores aprobados
        const aprobados = data.filter(j => j.estado === 'aprobado');
        // Convertir a objeto por cédula
        const jugadoresObj = {};
        aprobados.forEach(j => {
          jugadoresObj[j.cedula] = j;
        });
        setJugadoresReclutados(jugadoresObj);
      });
  }, [setJugadoresReclutados]);

  // Función para ordenar los jugadores
  const sortedPlayers = React.useMemo(() => {
    let sortablePlayers = [...Object.entries(jugadoresReclutados)];
    if (sortConfig.key) {
      sortablePlayers.sort((a, b) => {
        if (sortConfig.key === 'nombre') {
          const nameA = `${a[1].nombre} ${a[1].apellido}`.toLowerCase();
          const nameB = `${b[1].nombre} ${b[1].apellido}`.toLowerCase();
          if (sortConfig.direction === 'ascending') {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        } else if (sortConfig.key === 'cedula') {
          if (sortConfig.direction === 'ascending') {
            return a[0].localeCompare(b[0]);
          } else {
            return b[0].localeCompare(a[0]);
          }
        }
        return 0;
      });
    }
    return sortablePlayers;
  }, [jugadoresReclutados, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fas fa-sort" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <i className="fas fa-sort-up" /> 
      : <i className="fas fa-sort-down" />;
  };

  // Filtrar solo jugadores aprobados
  const filteredPlayers = sortedPlayers.filter(([cedula, player]) => {
    const termLower = searchTerm.toLowerCase();
    const fullName = `${player.nombre} ${player.apellido}`.toLowerCase();
    return (player.estado === "aprobado") && (fullName.includes(termLower) || cedula.includes(searchTerm));
  });

  const handlePlayerClick = (cedula) => {
    setSelectedPlayer(jugadoresReclutados[cedula]);
    setModalOpen(true);
  };

  const handleEliminarJugador = (cedula) => {
    setJugadorAEliminar(cedula);
    setModalEliminarOpen(true);
  };

  const confirmarEliminacion = async () => {
    // Cambiar el estado del jugador a "pendiente" en la base de datos
    await fetch(`http://localhost:5000/api/jugadores/${jugadorAEliminar}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado: 'pendiente' }),
    });
    // Actualizar el estado local
    const nuevosJugadores = { ...jugadoresReclutados };
    delete nuevosJugadores[jugadorAEliminar];
    setJugadoresReclutados(nuevosJugadores);
    // Recargar la lista de jugadores aprobados desde el backend
    fetch('http://localhost:5000/api/jugadores')
      .then(res => res.json())
      .then(data => {
        const aprobados = data.filter(j => j.estado === 'aprobado');
        const jugadoresObj = {};
        aprobados.forEach(j => {
          jugadoresObj[j.cedula] = j;
        });
        setJugadoresReclutados(jugadoresObj);
      });
    setModalEliminarOpen(false);
    setJugadorAEliminar(null);
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
       {/* Buscador */}
       <Row className="mb-4">
          <div className="col">
            <Card className="shadow">
              <CardBody>
        <Row>
                  <Col lg="12">
                    <FormGroup className="mb-0">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="fas fa-search" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input 
                          placeholder="Buscar por nombre o cédula..." 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Row>

        {/* Tabla de Jugadores */}
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Jugadores Reclutados</h3>
                  </Col>
                  <Col className="text-right">
                    <Button 
                      color="danger"
                      onClick={() => setModalEliminarOpen(true)}
                    >
                      Eliminar Jugador
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th 
                      scope="col" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => requestSort('nombre')}
                    >
                      Nombre {getSortIcon('nombre')}
                    </th>
                    <th 
                      scope="col" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => requestSort('cedula')}
                    >
                      Cédula {getSortIcon('cedula')}
                    </th>
                    <th scope="col">Posición</th>
                    <th scope="col">Edad</th>
                    <th scope="col">Altura</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(([cedula, player]) => (
                      <tr 
                        key={cedula}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handlePlayerClick(cedula)}
                      >
                        <td>
                          <span className="mb-0 text-sm">
                            {player.nombre} {player.apellido}
                          </span>
                        </td>
                        <td>{cedula}</td>
                        <td>{player.posicion}</td>
                        <td>{player.edad}</td>
                        <td>{player.altura}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <span className="text-muted">Aún no hay jugadores reclutados</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>

        {/* Modal de Confirmación de Eliminación */}
        <Modal
          isOpen={modalEliminarOpen}
          toggle={() => setModalEliminarOpen(false)}
          className="modal-dialog-centered"
        >
          <ModalHeader toggle={() => setModalEliminarOpen(false)}>
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Seleccione el jugador a eliminar</Label>
              <Input
                type="select"
                onChange={(e) => setJugadorAEliminar(e.target.value)}
                value={jugadorAEliminar || ""}
              >
                <option value="">Seleccione un jugador...</option>
                {Object.entries(jugadoresReclutados).map(([cedula, player]) => (
                  <option key={cedula} value={cedula}>
                    {player.nombre} {player.apellido} - {cedula}
                  </option>
                ))}
              </Input>
            </FormGroup>
            {jugadorAEliminar && (
              <div className="mt-3">
                <p className="text-danger">
                  ¿Está seguro que desea eliminar a {jugadoresReclutados[jugadorAEliminar]?.nombre} {jugadoresReclutados[jugadorAEliminar]?.apellido}?
                  Esta acción no se puede deshacer.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              onClick={confirmarEliminacion}
              disabled={!jugadorAEliminar}
            >
              Eliminar
            </Button>
            <Button color="secondary" onClick={() => setModalEliminarOpen(false)}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal de Detalles del Jugador */}
        <Modal
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
          className="modal-dialog-centered modal-lg"
        >
          <ModalHeader toggle={() => setModalOpen(false)}>
            Información del Jugador
            <div style={{ height: '3px', width: '100%', background: '#01920D', borderRadius: '2px', margin: '7px 0px 7px 0px' }} />
          </ModalHeader>
          <ModalBody>
            {selectedPlayer && (
              <Card>
                <CardBody>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label className="form-control-label">Nombre</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef' }}>
                          {selectedPlayer.nombre}
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <label className="form-control-label">Apellido</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef' }}>
                          {selectedPlayer.apellido}
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <label className="form-control-label">Cédula</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef' }}>
                          {selectedPlayer.cedula}
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label className="form-control-label">Edad</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef' }}>
                          {selectedPlayer.edad} años
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label className="form-control-label">Altura</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef' }}>
                          {selectedPlayer.altura} cm
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label className="form-control-label">Posición</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef', fontSize: '1.1rem', maxWidth: '180px', minWidth: '100px'}}>
                          {selectedPlayer.posicion}
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <label className="form-control-label">Especialización</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef', fontSize: '1.1rem', minWidth: '100px' }}>
                          {selectedPlayer.especializacion}
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label className="form-control-label">Pierna Hábil</label>
                        <div className="h4 font-weight-normal border rounded p-3" style={{ borderColor: '#e9ecef' }}>
                          {selectedPlayer.piernaHabil ? selectedPlayer.piernaHabil : 'No especificado'}
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label className="form-control-label">Trayectoria</label>
                        <div className="border rounded p-3" style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
                          <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {selectedPlayer.trayectoria}
                          </pre>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )}
          </ModalBody>
          <ModalFooter>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={require('../../assets/img/brand/logo.png')} alt="Logo" style={{ height: '50px', marginBottom: '25px' , marginTop: '-15px'}} />
              <Button color="secondary" onClick={() => setModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      </Container>
    </>
  );
};

export default Jugadores;