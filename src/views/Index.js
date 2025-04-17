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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";
import { useJugadores } from '../context/JugadoresContext';

const Index = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");
  const navigate = useNavigate();
  const { jugadoresReclutados } = useJugadores();

  // Estado para las próximas sesiones
  const [proximasSesiones, setProximasSesiones] = useState([
    { id: 1, titulo: "Sesión 1", fecha: "2025-05-01", hora: "10:00 AM" },
    { id: 2, titulo: "Sesión 2", fecha: "2025-05-10", hora: "11:00 AM" },
    { id: 3, titulo: "Sesión 3", fecha: "2025-05-15", hora: "12:00 PM" },
    { id: 4, titulo: "Sesión 4", fecha: "2025-05-20", hora: "09:00 PM" },
  ]);

  const [tituloSesion, setTituloSesion] = useState("");
  const [fechaSesion, setFechaSesion] = useState("");
  const [horaSesion, setHoraSesion] = useState("");
  const [sesionAEditar, setSesionAEditar] = useState(null);
  const [modal, setModal] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalNuevaSesion, setModalNuevaSesion] = useState(false);
  const [sesionAEliminar, setSesionAEliminar] = useState(null);
  const [nuevaSesion, setNuevaSesion] = useState({
    titulo: "",
    fecha: "",
    hora: ""
  });

  // Función para obtener la fecha mínima (hoy en formato YYYY-MM-DD)
  const obtenerFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // Función para calcular los días restantes
  const calcularDiasRestantes = (fecha) => {
    const fechaSesion = new Date(fecha); // Asegurarse de que la fecha esté en formato ISO
    const fechaActual = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Caracas" })); // Obtener la fecha actual en GMT-4
    const diferencia = fechaSesion - fechaActual;
    
    // Verificar que la diferencia no sea NaN
    if (isNaN(diferencia)) {
      return 0; // Si hay un error, retornar 0 días
    }
    
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Convertir a días
  };

  const toggleModalNuevaSesion = () => setModalNuevaSesion(!modalNuevaSesion);

  const handleNuevaSesionChange = (e) => {
    const { name, value } = e.target;
    setNuevaSesion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarNuevaSesion = () => {
    const sesion = {
      id: proximasSesiones.length + 1,
      titulo: nuevaSesion.titulo,
      fecha: new Date(nuevaSesion.fecha + 'T00:00:00-04:00').toISOString(),
      hora: nuevaSesion.hora
    };
    setProximasSesiones(prev => [...prev, sesion]);
    setNuevaSesion({ titulo: "", fecha: "", hora: "" });
    toggleModalNuevaSesion();
  };

  const toggleModal = () => setModal(!modal);

  const toggleModalEliminar = () => setModalEliminar(!modalEliminar);

  const confirmarEliminarSesion = (id) => {
    setSesionAEliminar(id);
    toggleModalEliminar();
  };

  const eliminarSesion = () => {
    setProximasSesiones(prevSesiones => 
      prevSesiones.filter(sesion => sesion.id !== sesionAEliminar)
    );
    setSesionAEliminar(null);
    toggleModalEliminar();
  };

  const editarSesion = (id) => {
    const sesionEditada = proximasSesiones.find(sesion => sesion.id === id);
    setTituloSesion(sesionEditada.titulo);
    setFechaSesion(sesionEditada.fecha);
    setHoraSesion(sesionEditada.hora);
    setSesionAEditar(id);
    toggleModal(); // Abrir el modal al editar
  };

  const guardarCambios = () => {
    setProximasSesiones(prevSesiones =>
      prevSesiones.map(sesion =>
        sesion.id === sesionAEditar
          ? { ...sesion, titulo: tituloSesion, fecha: new Date(fechaSesion + 'T00:00:00-04:00').toISOString(), hora: horaSesion }
          : sesion
      )
    );
    // Limpiar los campos
    setTituloSesion("");
    setFechaSesion("");
    setHoraSesion("");
    setSesionAEditar(null);
    toggleModal(); // Cerrar el modal después de guardar
  };

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  // Función para obtener la próxima sesión
  const obtenerProximaSesion = () => {
    const hoy = new Date();
    const sesionesFuturas = proximasSesiones.filter(sesion => new Date(sesion.fecha) > hoy);
    return sesionesFuturas.length > 0 ? sesionesFuturas[0] : null; // Retorna la primera sesión futura
  };

  const proximaSesion = obtenerProximaSesion();

  // Contar el número de solicitudes pendientes
  const contarSolicitudesPendientes = () => {
    return proximasSesiones.length - 2; // Cambia esto si necesitas contar solicitudes de otra fuente
  };

  const solicitudesPendientes = contarSolicitudesPendientes();

  return (
    <>
      <Header proximaSesion={proximaSesion} solicitudesPendientes={solicitudesPendientes} />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="bg-gradient-default shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-1">
                      Overview
                    </h6>
                    <h2 className="text-white mb-0">Sales value</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 1,
                          })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 1)}
                        >
                          <span className="d-none d-md-block">Month</span>
                          <span className="d-md-none">M</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 2,
                          })}
                          data-toggle="tab"
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 2)}
                        >
                          <span className="d-none d-md-block">Week</span>
                          <span className="d-md-none">W</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart">
                  <Line
                    data={chartExample1[chartExample1Data]}
                    options={chartExample1.options}
                    getDatasetAtEvent={(e) => console.log(e)}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Performance
                    </h6>
                    <h2 className="mb-0">Total orders</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart">
                  <Bar
                    data={chartExample2.data}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* Tarjeta para las próximas sesiones */}
        <Row className="mt-5">
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Próximas Sesiones</h3>
                  </Col>
                  <Col className="text-right">
                    <Button 
                      style={{ backgroundColor: '#01920D', borderColor: '#01920D', color: 'white' }}
                      onClick={toggleModalNuevaSesion}
                    >
                      Agregar Nueva Sesión
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Sesión</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Hora</th>
                    <th scope="col">Días para la Sesión</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proximasSesiones.map((sesion) => (
                    <tr key={sesion.id}>
                      <td>{sesion.titulo}</td>
                      <td>{new Date(sesion.fecha).toLocaleDateString()}</td>
                      <td>{sesion.hora}</td>
                      <td>{calcularDiasRestantes(sesion.fecha)}</td>
                      <td>
                        <Button color="warning" onClick={() => editarSesion(sesion.id)} className="mr-2">
                          Editar
                        </Button>
                        <Button color="danger" onClick={() => confirmarEliminarSesion(sesion.id)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>

        {/* Modal para nueva sesión */}
        <Modal isOpen={modalNuevaSesion} toggle={toggleModalNuevaSesion}>
          <ModalHeader toggle={toggleModalNuevaSesion}>
            Agregar Nueva Sesión
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Nombre de la Sesión</Label>
              <Input
                type="text"
                name="titulo"
                value={nuevaSesion.titulo}
                onChange={handleNuevaSesionChange}
                placeholder="Ingrese el nombre de la sesión"
              />
            </FormGroup>
            <FormGroup>
              <Label>Fecha de la Sesión</Label>
              <Input
                type="date"
                name="fecha"
                value={nuevaSesion.fecha}
                onChange={handleNuevaSesionChange}
                min={obtenerFechaMinima()}
              />
            </FormGroup>
            <FormGroup>
              <Label>Hora de la Sesión</Label>
              <Input
                type="time"
                name="hora"
                value={nuevaSesion.hora}
                onChange={handleNuevaSesionChange}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button 
              style={{ backgroundColor: '#01920D', borderColor: '#01920D', color: 'white' }}
              onClick={agregarNuevaSesion}
            >
              Agregar Sesión
            </Button>
            <Button color="secondary" onClick={toggleModalNuevaSesion}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal de confirmación para eliminar sesión */}
        <Modal isOpen={modalEliminar} toggle={toggleModalEliminar}>
          <ModalHeader toggle={toggleModalEliminar}>
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            ¿Está seguro que desea eliminar esta sesión? Esta acción no se puede deshacer.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={eliminarSesion}>
              Eliminar
            </Button>
            <Button color="secondary" onClick={toggleModalEliminar}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal para editar sesión */}
        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>
            Editar Sesión
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Nombre de la Sesión</Label>
              <Input
                type="text"
                value={tituloSesion}
                onChange={(e) => setTituloSesion(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Fecha de la Sesión</Label>
              <Input
                type="date"
                value={fechaSesion}
                onChange={(e) => setFechaSesion(e.target.value)}
                min={obtenerFechaMinima()}
              />
            </FormGroup>
            <FormGroup>
              <Label>Hora de la Sesión</Label>
              <Input
                type="time"
                value={horaSesion}
                onChange={(e) => setHoraSesion(e.target.value)}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button 
              style={{ backgroundColor: '#01920D', borderColor: '#01920D', color: 'white' }}
              onClick={guardarCambios}
            >
              Guardar Cambios
            </Button>
            <Button color="secondary" onClick={toggleModal}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>

        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Vista Previa de Jugadores Reclutados</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="success"
                      onClick={() => navigate("/admin/jugadores")}
                      size="sm"
                    >
                      Ver Todo
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive style={{ marginBottom: '50px' }}>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Cédula</th>
                    <th scope="col">Posición</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(jugadoresReclutados).map(([cedula, player]) => (
                    <tr key={cedula}>
                      <td>{player.nombre} {player.apellido}</td>
                      <td>{cedula}</td>
                      <td>{player.posicion}</td>
                      <td>
                        <Button 
                          color="success"
                          size="lg" 
                          onClick={() => navigate("/admin/jugadores")}
                        >
                          Ver Más
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
