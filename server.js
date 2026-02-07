const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;
const path = require("path");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // sirve index.html, usuario.html, etc

// DB (se crea si no existe)
const db = new sqlite3.Database("./app.db");

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
});

// GET: listar usuarios
app.get("/api/users", (req, res) => {
  db.all("SELECT id, name, created_at FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", details: err.message });
    res.json(rows);
  });
});

// POST: crear usuario
app.post("/api/users", (req, res) => {
  const name = (req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "name is required" });

  const createdAt = new Date().toISOString();
  db.run(
    "INSERT INTO users (name, created_at) VALUES (?, ?)",
    [name, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error", details: err.message });
      res.status(201).json({ id: this.lastID, name, created_at: createdAt });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});