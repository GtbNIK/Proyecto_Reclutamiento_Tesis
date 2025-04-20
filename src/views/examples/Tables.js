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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { agregarJugadores } = useJugadores();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('solicitudesJugadores');
    console.log('Datos cargados de localStorage (raw):', saved);
    
    if (saved && saved !== '{}') {
      try {
        const parsed = JSON.parse(saved);
        console.log('Datos parseados de localStorage:', JSON.stringify(parsed, null, 2));
        if (Object.keys(parsed).length > 0) {
          // Limpiar las cédulas existentes
          const cleanedPlayers = Object.entries(parsed).reduce((acc, [cedula, player]) => {
            const cleanedCedula = cedula.replace(/[^0-9]/g, ''); // Quitar puntos, guiones y letras
            acc[cleanedCedula] = { ...player, cedula: cleanedCedula }; // Actualizar cédula en el objeto
            return acc;
          }, {});
          return cleanedPlayers;
        }
      } catch (error) {
        console.error('Error al parsear datos de localStorage:', error);
      }
    }
    
    // Datos iniciales por defecto
    const initialData = {
      "25789456": { // Cédula sin puntos ni letras
      nombre: "Juan",
      apellido: "Pérez",
        cedula: "25789456",
      edad: 19,
      altura: 175,
      posicion: "Delantero",
      trayectoria: "- Academia de Fútbol Juvenil (2019-2021)\n- Club Deportivo Regional (2021-2023)\n- Selección Estadal Sub-20 (2022)",
        estado: "pendiente"
    },
      "26123789": { // Cédula sin puntos ni letras
      nombre: "Carlos",
      apellido: "Rodríguez",
        cedula: "26123789",
      edad: 20,
      altura: 180,
      posicion: "Mediocampista",
      trayectoria: "- Escuela de Fútbol Caracas (2018-2020)\n- Club Atlético Municipal (2020-2023)\n- Participación en Torneo Nacional Sub-21 (2022)",
        estado: "pendiente"
      },
      "27456123": {
        nombre: "Luis",
        apellido: "González",
        cedula: "27456123",
        edad: 21,
        altura: 185,
        posicion: "Defensa",
        trayectoria: "- Escuela de Fútbol Miranda (2017-2019)\n- Club Deportivo Capital (2019-2023)\n- Selección Nacional Sub-20 (2021)",
        estado: "pendiente"
      },
      "28789321": {
        nombre: "Andrés",
        apellido: "Martínez",
        cedula: "28789321",
        edad: 18,
        altura: 178,
        posicion: "Portero",
        trayectoria: "- Academia de Porteros Elite (2018-2020)\n- Club Atlético Valencia (2020-2023)\n- Selección Estadal Sub-19 (2022)",
        estado: "pendiente"
      },
      "29147258": {
        nombre: "Diego",
        apellido: "Hernández",
        cedula: "29147258",
        edad: 20,
        altura: 182,
        posicion: "Lateral",
        trayectoria: "- Escuela de Fútbol Lara (2018-2020)\n- Club Deportivo Lara (2020-2023)\n- Selección Regional Sub-20 (2022)",
        estado: "pendiente"
      },
      "29500123": {
        nombre: "Miguel",
        apellido: "Sánchez",
        cedula: "29500123",
        edad: 22,
        altura: 186,
        posicion: "Portero",
        trayectoria: "- Academia de Porteros Elite (2017-2019)\n- Club Deportivo Central (2019-2022)\n- Selección Nacional Sub-23 (2021)",
      estado: "pendiente"
    }
    };
    
    console.log('Usando datos iniciales:', JSON.stringify(initialData, null, 2));
    return initialData;
  });

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    console.log('Guardando jugadores en localStorage:', JSON.stringify(players, null, 2));
    localStorage.setItem('solicitudesJugadores', JSON.stringify(players));
  }, [players]);

  // Estado para el modal de confirmación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Estado para los jugadores filtrados
  const [filteredPlayers, setFilteredPlayers] = useState(() => {
    console.log('Inicializando filteredPlayers con players:', JSON.stringify(players, null, 2));
    const sortedPlayersList = Object.entries(players);
    console.log('Lista de jugadores ordenada:', JSON.stringify(sortedPlayersList, null, 2));
    const solicitudes = sortedPlayersList.filter(([_, player]) => player.estado === "pendiente");
    console.log('Solicitudes filtradas:', JSON.stringify(solicitudes, null, 2));
    return {
      solicitudes: solicitudes,
      preSeleccion: sortedPlayersList.filter(([_, player]) => player.estado === "aprobado")
    };
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

  // Función para filtrar jugadores
  const filterPlayers = (term) => {
    const termLower = term.toLowerCase();
    const sortedPlayersList = Object.entries(sortedPlayers);
    console.log('Jugadores ordenados:', sortedPlayersList);
    
    // Filtrar jugadores de solicitudes (estado pendiente)
    const solicitudesFiltered = sortedPlayersList
      .filter(([cedula, player]) => {
        const fullName = `${player.nombre} ${player.apellido}`.toLowerCase();
        const matches = (fullName.includes(termLower) || cedula.includes(term)) && player.estado === "pendiente";
        console.log(`Jugador ${fullName} (${cedula}) - Estado: ${player.estado} - Coincide: ${matches}`);
        return matches;
      });

    console.log('Solicitudes después de filtrar:', solicitudesFiltered);

    // Filtrar jugadores de pre-selección (estado aprobado)
    const preSeleccionFiltered = sortedPlayersList
      .filter(([cedula, player]) => {
        const fullName = `${player.nombre} ${player.apellido}`.toLowerCase();
        return (fullName.includes(termLower) || cedula.includes(term)) && player.estado === "aprobado";
      });

    return {
      solicitudes: solicitudesFiltered,
      preSeleccion: preSeleccionFiltered
    };
  };

  // Efecto para actualizar los jugadores filtrados
  React.useEffect(() => {
    console.log('Efecto ejecutado - searchTerm:', searchTerm);
    const filtered = filterPlayers(searchTerm);
    console.log('Resultado del filtrado:', filtered);
    setFilteredPlayers(filtered);
  }, [searchTerm, sortedPlayers]);

  // Función para manejar la aprobación de un jugador
  const handleApprove = (cedula) => {
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [cedula]: {
        ...prevPlayers[cedula],
        estado: "aprobado"
      }
    }));
  };

  const handleDeletePlayer = () => {
    if (playerToDelete) {
      setPlayers(prevPlayers => {
        const updatedPlayers = { ...prevPlayers };
        delete updatedPlayers[playerToDelete]; // Elimina al jugador
        return updatedPlayers;
      });
      setDeleteModalOpen(false); // Cierra el modal
    }
  };

  // Función para manejar el descarte de un jugador
  const handleDiscard = (cedula) => {
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [cedula]: {
        ...prevPlayers[cedula],
        estado: "descartado"
      }
    }));
  };

  // Función para manejar el retorno de un jugador a solicitudes
  const handleReturn = (cedula) => {
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [cedula]: {
        ...prevPlayers[cedula],
        estado: "pendiente"
      }
    }));
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
    setSelectedPlayer(players[cedula]);
    setModalOpen(true);
  };

  const handleConfirmPreSelection = () => {
    // Obtener todos los jugadores aprobados
    const jugadoresAprobados = Object.fromEntries(
      Object.entries(players).filter(([_, player]) => player.estado === "aprobado")
    );
    
    // Agregar a jugadores reclutados
    agregarJugadores(jugadoresAprobados);
    
    // Eliminar PERMANENTEMENTE de la lista actual
    setPlayers(prevPlayers => {
      const updatedPlayers = { ...prevPlayers };
      Object.keys(jugadoresAprobados).forEach(cedula => {
        delete updatedPlayers[cedula];
      });
      return updatedPlayers;
    });
    
    setConfirmModalOpen(false);
  };

  const [formModalOpen, setFormModalOpen] = useState(false);
  const toggleFormModal = () => setFormModalOpen(!formModalOpen);

  // Función para agregar un nuevo jugador
  const addPlayer = (newPlayer) => {
    setPlayers((prevPlayers) => ({
      ...prevPlayers,
      [newPlayer.cedula]: {
        ...newPlayer,
        estado: "pendiente", // Estado inicial
      },
    }));
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
                  <Col lg="11">
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
                  <Col lg="1">
                    <Button
                      color="primary"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="fas fa-search" />
                    </Button>
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
                      filteredPlayers.solicitudes.map(([cedula, player]) => (
                    <tr 
                      key={cedula}
                      style={{ cursor: 'pointer' }} 
                      className="hover-row"
                      onClick={() => handlePlayerClick(cedula)}
                    >
                          <td className="align-middle">
                            <span className="mb-0 text-sm font-weight-bold">
                              {player.nombre} {player.apellido}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span className="mb-0 text-sm">{cedula}</span>
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
                              onClick={(e) => {
                                e.preventDefault();
                                handleApprove(cedula);
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
                                    setPlayerToDelete(cedula);
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
                    filteredPlayers.preSeleccion.map(([cedula, player]) => (
                    <tr 
                      key={cedula}
                      style={{ cursor: 'pointer' }} 
                      className="hover-row"
                      onClick={() => handlePlayerClick(cedula)}
                    >
                      <td>
                        <span className="mb-0 text-sm">{player.nombre} {player.apellido}</span>
                    </td>
                      <td>{cedula}</td>
                      <td>{player.posicion}</td>
                      <td>
                        <Badge color="success">Aprobado</Badge>
                    </td>
                    <td>
                        <Button
                          color="warning"
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que el clic en el botón abra la carta
                            handleReturn(cedula);
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
                style={{ backgroundColor: '#02B911', borderColor: '#02B911' }} // Verde personalizado
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
            style={{ backgroundColor: '#02B911', borderColor: '#02B911' }} // Verde personalizado
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
                          {/* Por ahora vacío */}
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
        </Modal>

        <ReclutamientoForm isOpen={formModalOpen} toggle={toggleFormModal} addPlayer={addPlayer} />
      </Container>
    </>
  );
};

export default Tables;
