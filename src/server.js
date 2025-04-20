const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'reclutamiento'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error de conexión: ' + err.stack);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para agregar un jugador
app.post('/api/jugadores', (req, res) => {
    const jugador = req.body;
    console.log("Datos recibidos:", jugador);
    const query = 'INSERT INTO jugadores SET ?';
    db.query(query, jugador, (err, result) => {
        if (err) {
            console.error("Error al insertar en la base de datos:", err);
            return res.status(500).send({ error: "Error al insertar en la base de datos", details: err });
        }
        res.status(201).send({ id: result.insertId, ...jugador });
    });
});

// Ruta para obtener todos los jugadores
app.get('/api/jugadores', (req, res) => {
    const query = 'SELECT * FROM jugadores';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener jugadores:", err);
            return res.status(500).send({ error: "Error al obtener jugadores", details: err });
        }
        res.json(results); // <-- Esto devuelve un array de jugadores
    });
});

// Ruta para actualizar el estado de un jugador
app.put('/api/jugadores/:cedula', (req, res) => {
    const { cedula } = req.params;
    const { estado } = req.body;
    console.log('Actualizando jugador:', cedula, 'a estado:', estado);
    const query = 'UPDATE jugadores SET estado = ? WHERE cedula = ?';
    db.query(query, [estado, cedula], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado:", err);
            return res.status(500).send({ error: "Error al actualizar el estado", details: err });
        }
        res.send({ success: true });
    });
});

// Ruta para eliminar un jugador por cédula
app.delete('/api/jugadores/:cedula', (req, res) => {
    const { cedula } = req.params;
    const query = 'DELETE FROM jugadores WHERE cedula = ?';
    db.query(query, [cedula], (err, result) => {
        if (err) {
            console.error("Error al eliminar jugador:", err);
            return res.status(500).send({ error: "Error al eliminar jugador", details: err });
        }
        res.send({ success: true });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
