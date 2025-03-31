import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";

const ReclutamientoForm = ({ isOpen, toggle, addPlayer }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    edad: "",
    posicion: "",
    altura: "",
    trayectoria: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Agregar el nuevo jugador a la lista
    addPlayer(formData);
    console.log("Formulario enviado:", formData);
    toggle(); // Cerrar el modal después de enviar
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-lg">
      <ModalHeader toggle={toggle}>
        <h3 className="text-center" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Formulario de Reclutamiento</h3>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="nombre">Nombre</Label>
                <Input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} required />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="apellido">Apellido</Label>
                <Input type="text" name="apellido" id="apellido" value={formData.apellido} onChange={handleChange} required />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="cedula">Cédula</Label>
                <Input type="text" name="cedula" id="cedula" value={formData.cedula} onChange={handleChange} required />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="edad">Edad</Label>
                <Input type="number" name="edad" id="edad" value={formData.edad} onChange={handleChange} required />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="altura">Altura (cm)</Label>
                <Input type="number" name="altura" id="altura" value={formData.altura} onChange={handleChange} required />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="posicion">Posición</Label>
                <Input type="text" name="posicion" id="posicion" value={formData.posicion} onChange={handleChange} required />
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label for="trayectoria">Trayectoria</Label>
            <Input type="textarea" name="trayectoria" id="trayectoria" value={formData.trayectoria} onChange={handleChange} required />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" type="submit" onClick={handleSubmit}>Confirmar</Button>
        <Button color="secondary" onClick={toggle}>Volver</Button>
        <Button color="info" onClick={() => window.print()}>Imprimir</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReclutamientoForm;
