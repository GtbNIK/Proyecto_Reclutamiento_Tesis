/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  UncontrolledTooltip,
  CardBody,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Button,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import { useState, useEffect } from "react";
import React from "react";
import ReclutamientoForm from "../ReclutamientoForm";
import { useJugadores } from '../../context/JugadoresContext';

// Estilos para el efecto hover
const hoverStyles = `
  .hover-row:hover {
    background-color: #f8f9fa !important;
  }
`;

const Tables = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState({ solicitudes: [], preSeleccion: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const toggleFormModal = () => setFormModalOpen(!formModalOpen);
  const { agregarJugadores, setJugadoresReclutados } = useJugadores();

  // Obtener jugadores desde la base de datos al montar el componente
  useEffect(() => {
    fetch('http://localhost:5000/api/jugadores')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
      })
      .catch(err => console.error("Error al obtener jugadores:", err));
  }, []);

  // Sincronizar solicitudes pendientes en localStorage en tiempo real
  useEffect(() => {
    const solicitudesPendientes = players.filter(player => player.estado === 'pendiente' || !player.estado);
    // Guardar como objeto por cédula
    const solicitudesObj = {};
    solicitudesPendientes.forEach(j => {
      solicitudesObj[j.cedula] = j;
    });
    localStorage.setItem('solicitudesJugadores', JSON.stringify(solicitudesObj));
  }, [players]);

  // Filtrar jugadores por estado y búsqueda
  useEffect(() => {
    const termLower = searchTerm.toLowerCase();
    const solicitudes = players.filter(
      player =>
        (player.nombre + " " + player.apellido).toLowerCase().includes(termLower) ||
        player.cedula.includes(searchTerm)
    ).filter(player => player.estado === "pendiente" || !player.estado);

    const preSeleccion = players.filter(
      player =>
        ((player.nombre + " " + player.apellido).toLowerCase().includes(termLower) ||
        player.cedula.includes(searchTerm)) &&
        player.estado === "preseleccionado"
    );

    setFilteredPlayers({ solicitudes, preSeleccion });
  }, [players, searchTerm]);

  // Función para manejar la aprobación de un jugador
  const handleApprove = async (cedula) => {
    // Cambia en el backend
    await fetch(`http://localhost:5000/api/jugadores/${cedula}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'preseleccionado' })
    });

    // Cambia en el frontend
    setPlayers(prevPlayers => prevPlayers.map(player =>
      player.cedula === cedula ? { ...player, estado: "preseleccionado" } : player
    ));
  };

  // Función para manejar el retorno de un jugador a solicitudes
  const handleReturn = async (cedula) => {
    // Cambia en el backend
    await fetch(`http://localhost:5000/api/jugadores/${cedula}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'pendiente' })
    });

    // Cambia en el frontend
    setPlayers(prevPlayers => prevPlayers.map(player =>
      player.cedula === cedula ? { ...player, estado: "pendiente" } : player
    ));
  };

  // Función para manejar el descarte de un jugador
  const handleDiscard = (cedula) => {
    setPlayers(prevPlayers => prevPlayers.map(player =>
      player.cedula === cedula ? { ...player, estado: "descartado" } : player
    ));
  };

  // Función para manejar la eliminación de un jugador
  const handleDeletePlayer = async () => {
    if (playerToDelete) {
      // Eliminar en la base de datos
      await fetch(`http://localhost:5000/api/jugadores/${playerToDelete}`, {
        method: 'DELETE',
      });
      // Eliminar en el frontend
      setPlayers(prevPlayers => prevPlayers.filter(player => player.cedula !== playerToDelete));
      setDeleteModalOpen(false);
      // Recargar la lista desde el backend para asegurar sincronización
      fetch('http://localhost:5000/api/jugadores')
        .then(res => res.json())
        .then(data => {
          setPlayers(data);
          // Sincronizar contexto de jugadores reclutados (solo aprobados)
          const aprobados = data.filter(j => j.estado === 'aprobado');
          const jugadoresObj = {};
          aprobados.forEach(j => {
            jugadoresObj[j.cedula] = j;
          });
          setJugadoresReclutados(jugadoresObj);
        });
    }
  };

  // Función para agregar un nuevo jugador (opcional, si usas el modal de reclutamiento)
  const addPlayer = (newPlayer) => {
    setPlayers((prevPlayers) => ([
      ...prevPlayers,
      { ...newPlayer, estado: "pendiente" },
    ]));
  };

  // Agregar los estilos al componente
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = hoverStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePlayerClick = (cedula) => {
    const jugador = players.find(player => player.cedula === cedula);
    setSelectedPlayer(jugador);
    setModalOpen(true);
  };

  const handleConfirmPreSelection = async () => {
    // Obtener todos los jugadores preseleccionados
    const jugadoresPreseleccionados = players.filter(player => player.estado === "preseleccionado");

    // Actualizar en la base de datos
    await Promise.all(jugadoresPreseleccionados.map(jugador =>
      fetch(`http://localhost:5000/api/jugadores/${jugador.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'aprobado' })
      })
    ));

    // Cambiar en el frontend
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.estado === "preseleccionado"
          ? { ...player, estado: "aprobado" }
          : player
      )
    );

    setConfirmModalOpen(false);

    // Recargar la lista desde el backend para asegurar sincronización
    fetch('http://localhost:5000/api/jugadores')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        // Sincronizar contexto de jugadores reclutados (solo aprobados)
        const aprobados = data.filter(j => j.estado === 'aprobado');
        const jugadoresObj = {};
        aprobados.forEach(j => {
          jugadoresObj[j.cedula] = j;
        });
        setJugadoresReclutados(jugadoresObj);
      });
  };

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Función para ordenar los jugadores
  const sortedPlayers = React.useMemo(() => {
    let sortablePlayers = { ...players };
    if (sortConfig.key) {
      const sortedEntries = Object.entries(sortablePlayers).sort((a, b) => {
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
      sortablePlayers = Object.fromEntries(sortedEntries);
    }
    return sortablePlayers;
  }, [players, sortConfig]);

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

  return (
    <>
      {/* Simple header without stats */}
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Empty header body - no stats cards */}
          </div>
        </Container>
      </div>
      {/* Page content */}
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

        {/* Tabla de Solicitudes */}
        <Row className="mb-4">
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Solicitudes Pendientes</h3>
              </CardHeader>
              <div className="table-responsive">
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
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredPlayers.solicitudes.length > 0 ? (
                      filteredPlayers.solicitudes.map((player) => (
                    <tr 
                      key={player.cedula}
                      style={{ cursor: 'pointer' }} 
                      className="hover-row"
                      onClick={() => handlePlayerClick(player.cedula)}
                    >
                          <td className="align-middle">
                            <span className="mb-0 text-sm font-weight-bold">
                              {player.nombre} {player.apellido}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span className="mb-0 text-sm">{player.cedula}</span>
                          </td>
                          <td className="align-middle">
                            <span className="mb-0 text-sm">{player.posicion}</span>
                    </td>
                          <td className="align-middle" onClick={(e) => e.stopPropagation()}>
                        {player.estado === "pendiente" ? (
                              <div className="d-flex align-items-center">
                            <Button
                              color="success"
                                  size="sm"
                              className="mr-2"
                              onClick={async (e) => {
                                e.preventDefault();
                                await handleApprove(player.cedula);
                              }}
                            >
                              <i className="fas fa-check" />
                            </Button>
                            <Button
                              color="danger"
                                  size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                    setPlayerToDelete(player.cedula);
                                    setDeleteModalOpen(true);
                              }}
                            >
                              <i className="fas fa-times" />
                            </Button>
                              </div>
                        ) : player.estado === "descartado" ? (
                          <Button
                            color="danger"
                                size="sm"
                            disabled
                          >
                            No califica
                          </Button>
                        ) : (
                          <Badge color="success">Aprobado</Badge>
                        )}
                    </td>
                  </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <span className="text-muted">No hay jugadores pendientes</span>
                        </td>
                      </tr>
                    )}
                </tbody>
              </Table>
              </div>
            </Card>
          </div>
        </Row>

        {/* Tabla de Pre-Selección */}
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Pre-Selección</h3>
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
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.preSeleccion.length > 0 ? (
                    filteredPlayers.preSeleccion.map((player) => (
                    <tr 
                      key={player.cedula}
                      style={{ cursor: 'pointer' }} 
                      className="hover-row"
                      onClick={() => handlePlayerClick(player.cedula)}
                    >
                      <td>
                        <span className="mb-0 text-sm">{player.nombre} {player.apellido}</span>
                    </td>
                      <td>{player.cedula}</td>
                      <td>{player.posicion}</td>
                      <td>
                        <Badge color="success">Aprobado</Badge>
                    </td>
                    <td>
                        <Button
                          color="warning"
                          size="lg"
                          onClick={async (e) => {
                            e.stopPropagation(); // Evitar que el clic en el botón abra la carta
                            await handleReturn(player.cedula);
                          }}
                        >
                          Volver
                        </Button>
                    </td>
                  </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <span className="text-muted">No hay jugadores en la lista de Pre-selección</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Button
                color="primary"
                onClick={() => setConfirmModalOpen(true)}
                style={{ backgroundColor: '#01920D', borderColor: '#01920D' }} // Verde personalizado
              >
                Confirmar Pre-selección
              </Button>
            </Card>
                      </div>
        </Row>

        {/* Modal de Confirmación de Pre-selección */}
        <Modal
          className="modal-dialog-centered"
          isOpen={confirmModalOpen}
          toggle={() => setConfirmModalOpen(false)}
        >
          <ModalHeader toggle={() => setConfirmModalOpen(false)}>
            Confirmar Pre-selección
          </ModalHeader>
          <ModalBody>
            ¿Está seguro de que desea confirmar la pre-selección?
          </ModalBody>
          <ModalFooter>
          <Button 
            color="primary"
            onClick={handleConfirmPreSelection}
            style={{ backgroundColor: '#01920D', borderColor: '#01920D' }} // Verde personalizado
          >
            Confirmar
          </Button>
            <Button color="secondary" onClick={() => setConfirmModalOpen(false)}>Volver</Button>
          </ModalFooter>
        </Modal>

        <Modal
  className="modal-dialog-centered"
  isOpen={deleteModalOpen}
  toggle={() => setDeleteModalOpen(false)}
>
  <ModalHeader toggle={() => setDeleteModalOpen(false)}>
    Confirmar Eliminación
  </ModalHeader>
  <ModalBody>
    ¿Está seguro de que desea eliminar permanentemente a este jugador?
  </ModalBody>
  <ModalFooter>
    <Button color="danger" onClick={handleDeletePlayer}>
      Sí, Eliminar
    </Button>
    <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
      Cancelar
    </Button>
  </ModalFooter>
</Modal>

        {/* Modal de Información del Jugador */}
        <Modal
          className="modal-dialog-centered modal-lg"
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
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

        <ReclutamientoForm isOpen={formModalOpen} toggle={toggleFormModal} addPlayer={addPlayer} />
      </Container>
    </>
  );
};

export default Tables;
