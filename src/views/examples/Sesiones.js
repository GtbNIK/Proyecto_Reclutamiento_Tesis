/*!
=========================================================
* Sesiones Component - v1.0
=========================================================
* Sistema de Gestión de Sesiones de Entrenamiento
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
  Badge
} from "reactstrap";
import { useJugadores } from "../../context/JugadoresContext";

const Sesiones = () => {
  const { jugadoresReclutados } = useJugadores();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [sesiones, setSesiones] = useState([
    {
      id: 1,
      titulo: "Sesión Ofensiva",
      jugadores: Object.keys(jugadoresReclutados).map(cedula => ({
        cedula,
        nombre: jugadoresReclutados[cedula].nombre,
        apellido: jugadoresReclutados[cedula].apellido,
        goles: 0,
        asistencias: 0,
        pasesCompletados: 0,
        recuperaciones: 0
      }))
    },
    {
      id: 2,
      titulo: "Sesión Defensiva",
      jugadores: Object.keys(jugadoresReclutados).map(cedula => ({
        cedula,
        nombre: jugadoresReclutados[cedula].nombre,
        apellido: jugadoresReclutados[cedula].apellido,
        entradas: 0,
        intercepciones: 0,
        despejes: 0,
        faltas: 0
      }))
    }
  ]);
  const [editandoTitulo, setEditandoTitulo] = useState(null);
  const [nuevoTitulo, setNuevoTitulo] = useState("");

  const handlePlayerClick = (sesionId, jugador) => {
    setSelectedPlayer({ ...jugador, sesionId });
    setModalOpen(true);
  };

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
                      >
                        Cambiar Título
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Jugador</th>
                      {sesion.id === 1 ? (
                        <>
                          <th scope="col">Goles</th>
                          <th scope="col">Asistencias</th>
                          <th scope="col">Pases Completados</th>
                          <th scope="col">Recuperaciones</th>
                        </>
                      ) : (
                        <>
                          <th scope="col">Entradas</th>
                          <th scope="col">Intercepciones</th>
                          <th scope="col">Despejes</th>
                          <th scope="col">Faltas</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sesion.jugadores.map(jugador => (
                      <tr 
                        key={jugador.cedula}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handlePlayerClick(sesion.id, jugador)}
                      >
                        <td>{`${jugador.nombre} ${jugador.apellido}`}</td>
                        {sesion.id === 1 ? (
                          <>
                            <td><Badge color="success" style={{ fontSize: '1rem' }}>{jugador.goles}</Badge></td>
                            <td><Badge color="info" style={{ fontSize: '1rem' }}>{jugador.asistencias}</Badge></td>
                            <td><Badge color="primary" style={{ fontSize: '1rem' }}>{jugador.pasesCompletados}</Badge></td>
                            <td><Badge color="warning" style={{ fontSize: '1rem' }}>{jugador.recuperaciones}</Badge></td>
                          </>
                        ) : (
                          <>
                            <td><Badge color="danger" style={{ fontSize: '1rem' }}>{jugador.entradas}</Badge></td>
                            <td><Badge color="info" style={{ fontSize: '1rem' }}>{jugador.intercepciones}</Badge></td>
                            <td><Badge color="success" style={{ fontSize: '1rem' }}>{jugador.despejes}</Badge></td>
                            <td><Badge color="warning" style={{ fontSize: '1rem' }}>{jugador.faltas}</Badge></td>
                          </>
                        )}
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
        >
          <ModalHeader toggle={() => setModalOpen(false)}>
            Editar Estadísticas - {selectedPlayer?.nombre} {selectedPlayer?.apellido}
          </ModalHeader>
          <ModalBody>
            {selectedPlayer && (
              <Row>
                {selectedPlayer.sesionId === 1 ? (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Goles</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.goles}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            goles: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Asistencias</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.asistencias}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            asistencias: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Pases Completados</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.pasesCompletados}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            pasesCompletados: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Recuperaciones</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.recuperaciones}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            recuperaciones: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Entradas</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.entradas}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            entradas: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Intercepciones</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.intercepciones}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            intercepciones: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Despejes</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.despejes}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            despejes: parseInt(e.target.value) || 0
                          })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Faltas</Label>
                        <Input
                          type="number"
                          value={selectedPlayer.faltas}
                          onChange={(e) => setSelectedPlayer({
                            ...selectedPlayer,
                            faltas: parseInt(e.target.value) || 0
                          })}
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
      </Container>
    </>
  );
};

export default Sesiones;