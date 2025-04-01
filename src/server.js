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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
