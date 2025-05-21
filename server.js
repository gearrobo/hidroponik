const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 7001;

// Middleware
app.use(cors());
app.use(express.json()); // Sudah built-in untuk JSON body
app.use(express.static('.'));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sensorData',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize Database
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS device (
                id INT AUTO_INCREMENT PRIMARY KEY,
                serial_number VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS device_value (
                id INT AUTO_INCREMENT PRIMARY KEY,
                device_id INT,
                suhu FLOAT,
                kelembaban FLOAT,
                nutrisi FLOAT,
                tinggi FLOAT,
                pH FLOAT,
                uV VARCHAR(50),
                status VARCHAR(50),
                latitude FLOAT,
                longitude FLOAT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES device(id)
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS log_sensor (
                id INT AUTO_INCREMENT PRIMARY KEY,
                device_id INT,
                suhu FLOAT,
                kelembaban FLOAT,
                nutrisi FLOAT,
                tinggi FLOAT,
                pH FLOAT,
                uV VARCHAR(50),
                status VARCHAR(50),
                latitude FLOAT,
                longitude FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES device(id)
            )
        `);

        // Tambah tabel relay_setting (jalankan sekali saat init)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS relay_setting (
                id INT AUTO_INCREMENT PRIMARY KEY,
                device_id INT,
                relay1 BOOLEAN DEFAULT FALSE,
                relay2 BOOLEAN DEFAULT FALSE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES device(id)
            )
        `);


        connection.release();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Helper to safely extract nullable data
function safe(value) {
    return value ?? null;
}

// Endpoint menerima data dari perangkat
app.post('/api/data', async (req, res) => {
    const data = req.body;
    console.log('Incoming Data:', data);

    if (data.api_key !== 'restapisoendevtesting') {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [devices] = await connection.execute(
            'SELECT id FROM device WHERE serial_number = ?',
            [data.serial_number]
        );

        let deviceId;

        if (devices.length === 0) {
            const [result] = await connection.execute(
                'INSERT INTO device (serial_number) VALUES (?)',
                [data.serial_number]
            );
            deviceId = result.insertId;

            await connection.execute(`
                INSERT INTO device_value (device_id, suhu, kelembaban, nutrisi, tinggi, pH, uV, status, latitude, longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                deviceId,
                safe(data.suhu),
                safe(data.kelembaban),
                safe(data.nutrisi),
                safe(data.tinggi),
                safe(data.pH),
                safe(data.uV),
                safe(data.status),
                safe(data.latitude),
                safe(data.longitude)
            ]);
        } else {
            deviceId = devices[0].id;
        }

        await connection.execute(`
            INSERT INTO log_sensor (device_id, suhu, kelembaban, nutrisi, tinggi, pH, uV, status, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            deviceId,
            safe(data.suhu),
            safe(data.kelembaban),
            safe(data.nutrisi),
            safe(data.tinggi),
            safe(data.pH),
            safe(data.uV),
            safe(data.status),
            safe(data.latitude),
            safe(data.longitude)
        ]);

        await connection.execute(`
            UPDATE device_value 
            SET suhu = ?, kelembaban = ?, nutrisi = ?, tinggi = ?, pH = ?, 
                uV = ?, status = ?, latitude = ?, longitude = ?
            WHERE device_id = ?
        `, [
            safe(data.suhu),
            safe(data.kelembaban),
            safe(data.nutrisi),
            safe(data.tinggi),
            safe(data.pH),
            safe(data.uV),
            safe(data.status),
            safe(data.latitude),
            safe(data.longitude),
            deviceId
        ]);

        res.json({ success: true });

    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint data terbaru
app.get('/api/data/:serial_number', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(`
            SELECT dv.* 
            FROM device_value dv
            JOIN device d ON d.id = dv.device_id
            WHERE d.serial_number = ?
        `, [req.params.serial_number]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint riwayat sensor
app.get('/api/history/:serial_number', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(`
            SELECT ls.* 
            FROM log_sensor ls
            JOIN device d ON d.id = ls.device_id
            WHERE d.serial_number = ?
            ORDER BY ls.created_at DESC
            LIMIT 100
        `, [req.params.serial_number]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint ambil status relay
app.get('/api/relay/:serial_number', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT rs.relay1, rs.relay2
            FROM relay_setting rs
            JOIN device d ON d.id = rs.device_id
            WHERE d.serial_number = ?
        `, [req.params.serial_number]);

        if (rows.length === 0) {
            return res.json({ relay1: false, relay2: false });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching relay data:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint update status relay
app.post('/api/relay/:serial_number', async (req, res) => {
    const { relay1, relay2 } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();

        const [devices] = await connection.execute(
            'SELECT id FROM device WHERE serial_number = ?',
            [req.params.serial_number]
        );

        if (devices.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const deviceId = devices[0].id;

        const [existing] = await connection.execute(
            'SELECT * FROM relay_setting WHERE device_id = ?',
            [deviceId]
        );

        if (existing.length > 0) {
            await connection.execute(`
                UPDATE relay_setting
                SET relay1 = ?, relay2 = ?
                WHERE device_id = ?
            `, [!!relay1, !!relay2, deviceId]);
        } else {
            await connection.execute(`
                INSERT INTO relay_setting (device_id, relay1, relay2)
                VALUES (?, ?, ?)
            `, [deviceId, !!relay1, !!relay2]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating relay status:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Mulai Server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});
