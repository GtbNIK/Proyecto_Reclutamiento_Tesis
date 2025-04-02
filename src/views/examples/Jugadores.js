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
  Input
} from "reactstrap";
import { useJugadores } from "../../context/JugadoresContext"; // Importamos el hook del contexto

const Jugadores = () => {
  const { jugadoresReclutados } = useJugadores(); // Obtenemos los jugadores del contexto
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Filtrar jugadores
  const filteredPlayers = Object.entries(jugadoresReclutados).filter(([cedula, player]) => {
    const termLower = searchTerm.toLowerCase();
    const fullName = `${player.nombre} ${player.apellido}`.toLowerCase();
    return fullName.includes(termLower) || cedula.includes(searchTerm);
  });

  const handlePlayerClick = (cedula) => {
    setSelectedPlayer(jugadoresReclutados[cedula]);
    setModalOpen(true);
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
                <h3 className="mb-0">Jugadores Reclutados</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Cédula</th>
                    <th scope="col">Posición</th>
                    <th scope="col">Trayectoria</th>
                    <th scope="col">Referencia</th>
                    <th scope="col">Valoración</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map(([cedula, player]) => (
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
                      <td>
                        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {player.referencia}
                        </div>
                      </td>
                      <td>{player.valoracion}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>

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
                <Row className="mt-3">
                  <Col>
                    <h5>Referencia</h5>
                    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {selectedPlayer.referencia}
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