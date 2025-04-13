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
import { Link, useNavigate } from "react-router-dom";
// reactstrap components
import {
  Navbar,
  Nav,
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useState } from "react";

const AdminNavbar = (props) => {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogoutModalOpen(false);
    navigate("/"); // Redirigir a la landing page
  };

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/admin/principal"
          >
            {props.brandText}
          </Link>
          <Nav className="align-items-center" navbar>
            <Button
              color="white"
              size="lg"
              onClick={() => setLogoutModalOpen(true)}
              style={{
                color: '#2dce89',
                fontWeight: 'bold',
                padding: '0.5rem 1.5rem',
                fontSize: '1rem'
              }}
            >
              <i className="ni ni-user-run mr-2" />
              Cerrar Sesión
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Modal
        className="modal-dialog-centered"
        isOpen={logoutModalOpen}
        toggle={() => setLogoutModalOpen(false)}
      >
        <ModalHeader toggle={() => setLogoutModalOpen(false)}>
          Confirmar Cierre de Sesión
        </ModalHeader>
        <ModalBody>
          ¿Está seguro de que desea cerrar sesión?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleLogout}>Sí</Button>
          <Button color="secondary" onClick={() => setLogoutModalOpen(false)}>No</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AdminNavbar;
