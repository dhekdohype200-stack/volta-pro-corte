import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    service_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('business_name', 'Volta Pro Corte');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('business_email', 'barbearia@premium.com');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('start_time', '08:00');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('end_time', '19:00');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

  app.post('/api/services', (req, res) => {
    const { name, price, duration } = req.body;
    const result = db.prepare('INSERT INTO services (name, price, duration) VALUES (?, ?, ?)').run(name, price, duration);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete('/api/services/:id', (req, res) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Clients API
  app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name ASC').all();
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const { name, phone } = req.body;
    try {
      const result = db.prepare('INSERT INTO clients (name, phone) VALUES (?, ?)').run(name, phone);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: 'Cliente já existe ou erro no cadastro' });
    }
  });

  app.delete('/api/clients/:id', (req, res) => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/appointments', (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, s.name as service_name, s.price as service_price 
      FROM appointments a 
      JOIN services s ON a.service_id = s.id
      ORDER BY a.date ASC, a.time ASC
    `).all();
    res.json(appointments);
  });

  app.post('/api/appointments', (req, res) => {
    const { client_name, client_phone, service_id, date, time } = req.body;
    const result = db.prepare('INSERT INTO appointments (client_name, client_phone, service_id, date, time) VALUES (?, ?, ?, ?, ?)').run(client_name, client_phone, service_id, date, time);
    
    // Also add to clients table if not exists
    db.prepare('INSERT OR IGNORE INTO clients (name, phone) VALUES (?, ?)').run(client_name, client_phone);
    
    res.json({ id: result.lastInsertRowid });
  });

  app.delete('/api/appointments/:id', (req, res) => {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.patch('/api/appointments/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post('/api/settings', (req, res) => {
    const settings = req.body;
    const insert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        insert.run(key, value);
      }
    });
    transaction(settings);
    res.json({ success: true });
  });

  app.get('/api/inactive-clients', (req, res) => {
    const inactiveClients = db.prepare(`
      SELECT 
        client_name, 
        client_phone, 
        MAX(date) as last_visit,
        AVG(s.price) as avg_price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      GROUP BY client_phone
      HAVING last_visit < date('now', '-30 days')
      ORDER BY last_visit DESC
    `).all();
    res.json(inactiveClients);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
