import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";
import defaultImage from '../assets/img/theme/football-training-form.jpg';

const ReclutamientoForm = ({ isOpen, toggle }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    edad: "",
    posicion: "",
    especializacion: "",
    altura: "",
    trayectoria: "",
    piernaHabil: ""
  });

  const [errors, setErrors] = useState({}); // Estado para manejar errores
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Definir las opciones de posiciones y especializaciones
  const posiciones = ["Delantero", "Mediocampista", "Defensa", "Portero"];
  
  const especializaciones = {
    Delantero: ["Delantero Centro", "Extremo Izquierdo", "Extremo Derecho"],
    Mediocampista: ["Mediocampista Ofensivo", "Mediocampista Defensivo", "Mediocampista Central"],
    Defensa: ["Defensa Central", "Lateral"],
    Portero: []
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
          return 'Solo se permiten letras en este campo';
        }
        break;
      case 'cedula':
        // Solo números positivos
        if (!/^\d+$/.test(value)) {
          return 'La cédula solo debe contener números';
        }
        break;
      case 'edad':
        const edad = parseInt(value);
        if (isNaN(edad) || edad < 16 || edad > 25) {
          return 'La edad debe estar entre 16 y 25 años';
        }
        break;
      case 'altura':
        const altura = parseInt(value);
        if (isNaN(altura) || altura < 150 || altura > 210) {
          return 'La altura debe estar entre 150 y 210 cm';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas para cada campo
    if (name === 'cedula' && !/^\d*$/.test(value)) {
      return; // No actualizar si no son números
    }

    // Validación para nombre y apellido (solo letras y espacios)
    if ((name === 'nombre' || name === 'apellido') && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      return; // No actualizar si contiene números o caracteres especiales
    }

    if (name === 'posicion') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        especializacion: '' // Resetear especialización cuando cambia la posición
      }));
    } else {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const jugador = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      cedula: formData.cedula,
      edad: parseInt(formData.edad, 10),
      posicion: formData.posicion,
      especializacion: formData.especializacion,
      altura: parseInt(formData.altura, 10),
      trayectoria: formData.trayectoria,
      piernaHabil: formData.piernaHabil,
      estado: "pendiente"
    };

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
        setShowSuccessModal(true); // Mostrar modal de éxito
      } else {
        const errorData = await response.json();
        console.error("Error al agregar jugador:", errorData);
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const handlePiernaHabilClick = (pierna) => {
    setFormData(prev => ({
      ...prev,
      piernaHabil: pierna
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    toggle();
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} className="modal-xl">
        <ModalHeader toggle={toggle}>
          <h3 className="text-center" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Formulario de Reclutamiento</h3>
          <hr style={{ border: '1px solid #2dce89', margin: '05px 0' }} />
        </ModalHeader>
        <ModalBody>
          <style>
            {`
              input[type="range"] {
                -webkit-appearance: none; /* Eliminar el estilo predeterminado */
                width: 100%;
              }

              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none; /* Eliminar el estilo predeterminado */
                appearance: none;
                width: 20px; /* Ancho del thumb */
                height: 20px; /* Alto del thumb */
                border-radius: 50%; /* Hacerlo circular */
                background: #2dce89; /* Color verde */
                cursor: pointer; /* Cambiar el cursor al pasar sobre el thumb */
              }

              input[type="range"]::-moz-range-thumb {
                width: 20px; /* Ancho del thumb */
                height: 20px; /* Alto del thumb */
                border-radius: 50%; /* Hacerlo circular */
                background: #2dce89; /* Color verde */
                cursor: pointer; /* Cambiar el cursor al pasar sobre el thumb */
              }
            `}
          </style>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="nombre">Nombre</Label>
                      <Input 
                        type="text" 
                        name="nombre" 
                        placeholder="Ingrese su primer Nombre"
                        id="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                        style={{
                          backgroundColor: '#f8f9fe',
                          border: '1px solid #e9ecef',
                          borderRadius: '0.375rem',
                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="apellido">Apellido</Label>
                      <Input 
                        type="text" 
                        name="apellido" 
                        placeholder="Ingrese su primer Apellido"
                        id="apellido" 
                        value={formData.apellido} 
                        onChange={handleChange} 
                        required 
                        style={{
                          backgroundColor: '#f8f9fe',
                          border: '1px solid #e9ecef',
                          borderRadius: '0.375rem',
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="cedula">Cédula</Label>
                      <Input 
                        type="text" 
                        name="cedula" 
                        placeholder="Ingrese su cédula"
                        id="cedula" 
                        value={formData.cedula} 
                        onChange={handleChange} 
                        required 
                        invalid={!!errors.cedula}
                        style={{
                          backgroundColor: '#f8f9fe',
                          border: '1px solid #e9ecef',
                          borderRadius: '0.375rem',
                        }}
                      />
                      {errors.cedula && <div className="text-danger">{errors.cedula}</div>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="edad">Edad</Label>
                      <Input 
                        type="number" 
                        name="edad" 
                        placeholder="Entre 16-25 años"
                        id="edad" 
                        value={formData.edad} 
                        onChange={handleChange} 
                        min="16" 
                        max="25" 
                        required 
                        invalid={!!errors.edad}
                        style={{
                          backgroundColor: '#f8f9fe',
                          border: '1px solid #e9ecef',
                          borderRadius: '0.375rem',
                        }}
                      />
                      {errors.edad && <div className="text-danger">{errors.edad}</div>}
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="altura">Altura: {formData.altura || 150} cm</Label>
                      <Input 
                        type="range" 
                        name="altura" 
                        id="altura" 
                        value={formData.altura || 150} 
                        onChange={handleChange} 
                        min="150" 
                        max="210" 
                        required 
                        style={{
                          width: '100%',
                          height: '6px',
                          background: '#2dce89',
                          borderRadius: '3px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                      <div className="d-flex justify-content-between mt-1">
                        <small style={{ color: '#6c757d' }}>150 cm</small>
                        <small style={{ color: '#6c757d' }}>210 cm</small>
                      </div>
                      {errors.altura && <div className="text-danger">{errors.altura}</div>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Pierna Hábil</Label>
                      <div className="d-flex gap-3">
                        <Button
                          type="button"
                          onClick={() => handlePiernaHabilClick("Derecha")}
                          style={{
                            backgroundColor: formData.piernaHabil === "Derecha" ? "#2dce89" : "white",
                            color: formData.piernaHabil === "Derecha" ? "white" : "#2dce89",
                            border: "2px solid #2dce89",
                            transition: "all 0.15s ease",
                            flex: 1
                          }}
                        >
                          Derecha
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handlePiernaHabilClick("Izquierda")}
                          style={{
                            backgroundColor: formData.piernaHabil === "Izquierda" ? "#2dce89" : "white",
                            color: formData.piernaHabil === "Izquierda" ? "white" : "#2dce89",
                            border: "2px solid #2dce89",
                            transition: "all 0.15s ease",
                            flex: 1
                          }}
                        >
                          Izquierda
                        </Button>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="posicion">Posición</Label>
                      <Input
                        type="select"
                        name="posicion"
                        id="posicion"
                        value={formData.posicion}
                        onChange={handleChange}
                        required
                        style={{
                          backgroundColor: '#f8f9fe',
                          border: '1px solid #e9ecef',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(50,50,93,.15), 0 1px 0 rgba(0,0,0,.02)',
                          transition: 'box-shadow .15s ease, border-color .15s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Selecciona una posición</option>
                        {posiciones.map((pos) => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  {formData.posicion && formData.posicion !== "Portero" && (
                    <Col md={6}>
                      <FormGroup>
                        <Label for="especializacion">Especialización</Label>
                        <Input
                          type="select"
                          name="especializacion"
                          id="especializacion"
                          value={formData.especializacion}
                          onChange={handleChange}
                          required
                          style={{
                            backgroundColor: '#f8f9fe',
                            border: '1px solid #e9ecef',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 3px rgba(50,50,93,.15), 0 1px 0 rgba(0,0,0,.02)',
                            transition: 'box-shadow .15s ease, border-color .15s ease',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Selecciona una especialización</option>
                          {especializaciones[formData.posicion]?.map((esp) => (
                            <option key={esp} value={esp}>{esp}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  )}
                </Row>

                <FormGroup>
                  <Label for="trayectoria">Trayectoria (Opcional)</Label>
                  <Input 
                    type="textarea" 
                    name="trayectoria" 
                    id="trayectoria" 
                    value={formData.trayectoria} 
                    onChange={handleChange}
                    placeholder="Ejemplo: Club Deportivo Universitario (2020-2021), Academia de Fútbol Juvenil (2021-2022)"
                    style={{
                      minHeight: "100px",
                      backgroundColor: '#f8f9fe',
                      border: '1px solid #e9ecef',
                      borderRadius: '0.375rem',
                    }}
                  />
                </FormGroup>
              </Col>

              <Col md={4} className="d-flex align-items-center justify-content-center">
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    backgroundColor: '#f8f9fe',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    padding: '20px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={defaultImage} 
                    alt="Balones de fútbol" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              </Col>
            </Row>

            <ModalFooter>
              <Button 
                color="success"
                type="submit"
              >
                Confirmar
              </Button>
              <Button color="secondary" onClick={toggle}>Volver</Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>

      <Modal 
        isOpen={showSuccessModal} 
        toggle={() => setShowSuccessModal(false)}
        centered
        size="sm"
      >
        <ModalBody className="text-center p-5">
          <div className="mb-4">
            <i className="fas fa-check-circle fa-4x" style={{ color: '#2dce89' }}></i>
          </div>
          <h4 className="mb-4">Guardado exitosamente</h4>
          <div className="d-flex justify-content-center gap-3">
            <Button
              color="success"
              outline
              onClick={handlePrint}
              style={{
                borderColor: '#2dce89',
                color: '#2dce89',
                padding: '0.75rem 1.5rem',
              }}
            >
              <i className="fas fa-print mr-2"></i> Imprimir
            </Button>
            <Button
              color="success"
              onClick={handleCloseSuccess}
              style={{
                backgroundColor: '#2dce89',
                borderColor: '#2dce89',
                padding: '0.75rem 1.5rem',
              }}
            >
              Cerrar
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ReclutamientoForm;
