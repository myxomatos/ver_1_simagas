### Aplicacion de prueba Base de datos


```
db.serialize(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS almacenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      ciudad TEXT,
      capacidad INTEGER,
      responsable TEXT,
      telefono TEXT,
      tipo TEXT,
      activo INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);
});
```