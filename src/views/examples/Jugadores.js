/*!
=========================================================
* Jugadores Component - v1.0
=========================================================
* Sistema de Gestión de Jugadores Reclutados
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

  // Filtrar jugadores
  const filteredPlayers = sortedPlayers.filter(([cedula, player]) => {
    const termLower = searchTerm.toLowerCase();
    const fullName = `${player.nombre} ${player.apellido}`.toLowerCase();
    return fullName.includes(termLower) || cedula.includes(searchTerm);
  });

  const handlePlayerClick = (cedula) => {
    setSelectedPlayer(jugadoresReclutados[cedula]);
    setModalOpen(true);
  };

  const handleEliminarJugador = (cedula) => {
    setJugadorAEliminar(cedula);
    setModalEliminarOpen(true);
  };

  const confirmarEliminacion = () => {
    const nuevosJugadores = { ...jugadoresReclutados };
    const jugadorRestaurado = nuevosJugadores[jugadorAEliminar];
    delete nuevosJugadores[jugadorAEliminar];
    setJugadoresReclutados(nuevosJugadores);
    // Restaurar a solicitudesJugadores en localStorage
    if (jugadorRestaurado) {
      const solicitudes = localStorage.getItem('solicitudesJugadores');
      let solicitudesObj = solicitudes ? JSON.parse(solicitudes) : {};
      solicitudesObj[jugadorAEliminar] = {
        ...jugadorRestaurado,
        estado: 'pendiente'
      };
      localStorage.setItem('solicitudesJugadores', JSON.stringify(solicitudesObj));
    }
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
          <Col>
            <Card className="shadow">
              <CardBody>
                <FormGroup>
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fas fa-search" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Buscar por nombre o cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </FormGroup>
              </CardBody>
            </Card>
          </Col>
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
                    <th scope="col">Trayectoria</th>
                    <th scope="col">Valoración</th>
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
                        <td>
                          <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {player.trayectoria}
                          </div>
                        </td>
                        <td>{player.valoracion}</td>
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
            Detalles del Jugador
          </ModalHeader>
          <ModalBody>
            {selectedPlayer && (
              <div className="pl-4 pr-4">
                <Row>
                  <Col md="6">
                    <h5>Nombre: {selectedPlayer.nombre} {selectedPlayer.apellido}</h5>
                    <p>Cédula: {selectedPlayer.cedula}</p>
                    <p>Edad: {selectedPlayer.edad} años</p>
                  </Col>
                  <Col md="6">
                    <h5>Posición: {selectedPlayer.posicion}</h5>
                    <p>Altura: {selectedPlayer.altura} cm</p>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col>
                    <h5>Trayectoria</h5>
                    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {selectedPlayer.trayectoria}
                      </pre>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModalOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </>
  );
};

export default Jugadores;