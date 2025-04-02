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
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const Header = ({ proximaSesion, solicitudesPendientes }) => {
  const calcularDiasRestantes = (fecha) => {
    const fechaSesion = new Date(fecha);
    const fechaActual = new Date();
    const diferencia = fechaSesion - fechaActual;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Convertir a días
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row>
              {/* Nueva tarjeta para solicitudes pendientes */}
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Solicitudes Pendientes
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {solicitudesPendientes}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-user-clock" />
                        </div>
                      </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-nowrap">Total de solicitudes</span>
                    </p>
                  </CardBody>
                </Card>
              </Col>
              {/* Carta para la próxima sesión */}
              {proximaSesion && (
                <Col lg="6" xl="4">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Próxima Sesión
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">
                            Faltan {calcularDiasRestantes(proximaSesion.fecha)} días
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                            <i className="fas fa-calendar-alt" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-nowrap">{proximaSesion.titulo}</span>
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;
