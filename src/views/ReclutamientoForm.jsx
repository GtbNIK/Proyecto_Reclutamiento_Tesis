import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";

const ReclutamientoForm = ({ isOpen, toggle }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Asegúrate de que los datos sean del tipo correcto
    const jugador = {
        nombre: formData.nombre, // String
        apellido: formData.apellido, // String
        cedula: formData.cedula, // String
        edad: parseInt(formData.edad, 10), // Convertir a número
        posicion: formData.posicion, // String
        altura: parseInt(formData.altura, 10), // Convertir a número
        trayectoria: formData.trayectoria // String
    };

    console.log("Datos a enviar:", jugador); // Verifica los datos que se enviarán

    try {
        const response = await fetch('http://localhost:5000/api/jugadores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jugador),
        });
        if (response.ok) {
            console.log("Jugador agregado:", jugador);
            toggle(); // Cerrar el modal después de enviar
        } else {
            console.error("Error al agregar jugador");
        }
    } catch (error) {
        console.error("Error de red:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-lg">
      <ModalHeader toggle={toggle}>
        <h3 className="text-center" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Formulario de Reclutamiento</h3>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="nombre">Nombre</Label>
            <Input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="apellido">Apellido</Label>
            <Input type="text" name="apellido" id="apellido" value={formData.apellido} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="cedula">Cédula</Label>
            <Input type="text" name="cedula" id="cedula" value={formData.cedula} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="edad">Edad</Label>
            <Input type="number" name="edad" id="edad" value={formData.edad} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="altura">Altura (cm)</Label>
            <Input type="number" name="altura" id="altura" value={formData.altura} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="posicion">Posición</Label>
            <Input type="text" name="posicion" id="posicion" value={formData.posicion} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="trayectoria">Trayectoria</Label>
            <Input type="textarea" name="trayectoria" id="trayectoria" value={formData.trayectoria} onChange={handleChange} required />
          </FormGroup>
          <ModalFooter>
            <Button color="primary" type="submit">Confirmar</Button>
            <Button color="secondary" onClick={toggle}>Volver</Button>
            <Button color="info" onClick={() => window.print()}>Imprimir</Button>
          </ModalFooter>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default ReclutamientoForm;
