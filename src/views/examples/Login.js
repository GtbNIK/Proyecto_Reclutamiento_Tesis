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
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
  Container,
  CardFooter,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Por favor, ingresa un correo válido.");
      return;
    }

    navigate("/admin/");
  };

  return (
    <Container className="mt--8 pb-5">
      <Row className="justify-content-center mt-4">
        <Col lg="5" md="7">
          <Card className="bg-lighter shadow border-0" data-aos="fade-down">
            <CardHeader className="bg-transparent pb-3 d-flex align-items-center justify-content-center text-center" style={{ height: '80px' }}>
              <h1 className="mb-0">Iniciar Sesión</h1>
            </CardHeader>
            <CardBody className="px-lg-5 py-lg-5">
              <div className="text-center text-muted mb-3">
                <medium>Ingresa tus datos e Inicia Sesión</medium>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <Form role="form" onSubmit={handleSubmit}>
                <FormGroup className="mb-3">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-email-83" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Correo"
                      type="email"
                      autoComplete="new-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-lock-circle-open" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Contraseña"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </InputGroup>
                </FormGroup>
                <div className="custom-control custom-control-alternative custom-checkbox">
                  <input
                    className="custom-control-input"
                    id="customCheckLogin"
                    type="checkbox"
                  />
                </div>
                <div className="text-center">
                  <Button className="my-4" style={{ backgroundColor: '#01920D', color: 'white' }} type="submit">
                    Iniciar Sesión
                  </Button>
                </div>
              </Form>
            </CardBody>
            <CardFooter className="text-center bg-lighter">
              <img src={require("../../assets/img/brand/logo.png")} alt="Logo" style={{ width: '100px' }} />
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
