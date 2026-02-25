const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const path = require('path');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // sirve index.html, usuario.html, etc

// DB (se crea si no existe)
const db = new sqlite3.Database('./app.db');

// Crear tabla si no existe
db.serialize(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vencli (
      cli_llave VARCHR(15) PRIMARY KEY,
      cli_nombre VARCHR(100),
      cli_abrev VARCHR(10),
      cli_tipo_adm INT NOT NULL,
      cli_calle VARCHR(50),
      cli_n_ext VARCHR(10),
      cli_n_int VARCHR(10),
      cli_colonia VARCHR(50),
      cli_municipio VARCHR(50),
      cli_ciudad VARCHR(50),
      cli_estado VARCHR(15),
      cli_cp VARCHR(7),
      cli_pais VARCHR(15),
      cli_ruta INT NOT NULL,
      cli_rfc VARCHR(15),
      cli_curp VARCHR(20),
      cli_mail VARCHR(50),
      cli_telefono VARCHR(15),
      cli_celular VARCHR(15),
      cli_contacto VARCHR(50),
      cli_lista_pre INT NOT NULL,
      cli_plazo INT NOT NULL,
      cli_limite FLOAT NOT NULL,
      cli_saldo FLOAT NOT NULL,
      cli_adic_1 VARCHR(20),
      cli_adic_2 VARCHR(20),
      cli_adic_3 VARCHR(20),
      cli_adic_4 VARCHR(20),
      cli_adic_5 VARCHR(20),
      cli_cta_pago VARCHR(20),
      cli_dir_envio VARCHR(100),
      cli_f_alt DATE,
      cli_f_mod DATE
    );

    CREATE TABLE IF NOT EXISTS venedif (
      edi_cli VARCHR(15),
      edi_llave VARCHR(15),
      edi_nombre VARCHR(100),
      edi_abrev VARCHR(10),
      edi_tipo_adm INT NOT NULL,
      edi_calle VARCHR(50),
      edi_n_ext VARCHR(10),
      edi_n_int VARCHR(10),
      edi_colonia VARCHR(50),
      edi_municipio VARCHR(50),
      edi_ciudad VARCHR(50),
      edi_estado VARCHR(15),
      edi_cp VARCHR(7),
      edi_pais VARCHR(15),
      edi_ruta INT NOT NULL,
      edi_lista_pre INT NOT NULL,
      edi_plazo INT NOT NULL,
      edi_limite FLOAT NOT NULL,
      edi_saldo FLOAT NOT NULL,
      edi_adic_1 VARCHR(20),
      edi_adic_2 VARCHR(20),
      edi_adic_3 VARCHR(20),
      edi_adic_4 VARCHR(20),
      edi_adic_5 VARCHR(20),
      edi_f_alt DATE,
      edi_f_mod DATE,
      edi_f_ven DATE,
      edi_f_pag DATE,
      PRIMARY KEY (edi_cli, edi_llave)
    );
 
    CREATE TABLE IF NOT EXISTS ventanq (
      tqe_cli VARCHR(15),
      tqe_edi VARCHR(15),
      tqe_medidor VARCHR(20),
      tqe_capacidad FLOAT NOT NULL,
      tqe_adic_1 VARCHR(20),
      tqe_adic_2 VARCHR(20),
      tqe_adic_3 VARCHR(20),
      tqe_adic_4 VARCHR(20),
      tqe_adic_5 VARCHR(20),
      tqe_f_alt DATE,
      tqe_f_mod DATE,
      PRIMARY KEY (tqe_cli, tqe_edi, tqe_medidor)
    );
 
    CREATE TABLE IF NOT EXISTS vendepto (
      dep_cli VARCHR(15),
      dep_edi VARCHR(15),
      dep_tqe VARCHR(20),
      dep_depto VARCHR(20),
      dep_servicio VARCHR(20),
      dep_adic_1 VARCHR(20),
      dep_adic_2 VARCHR(20),
      dep_adic_3 VARCHR(20),
      dep_adic_4 VARCHR(20),
      dep_adic_5 VARCHR(20),
      dep_f_alt DATE,
      dep_f_mod DATE,
      PRIMARY KEY (dep_cli, dep_edi, dep_tqe, dep_depto)
    );

    CREATE TABLE IF NOT EXISTS vendeptoaux (
      adep_cli VARCHR(15),
      adep_edi VARCHR(15),
      adep_tqe VARCHR(20),
      adep_depto VARCHR(20),
      adep_depto_medidor VARCHR(20),
      adep_servicio VARCHR(20),
      adep_adic_1 VARCHR(20),
      adep_adic_2 VARCHR(20),
      adep_adic_3 VARCHR(20),
      adep_adic_4 VARCHR(20),
      adep_adic_5 VARCHR(20),
      adep_f_alt DATE,
      adep_f_mod DATE,
      adep_f_baj DATE,
      PRIMARY KEY (adep_cli, adep_edi, adep_tqe, adep_depto, adep_depto_medidor)
    );

    CREATE TABLE IF NOT EXISTS vendoc (
      vdoc_ope INT NOT NULL,
      vdoc_fol VARCHR(25) NOT NULL,
      vdoc_ope_aux INT,
      vdoc_fol_aux VARCHR(25),
      vdoc_fch DATE,
      vdoc_cli VARCHR(15),
      vdoc_edi VARCHR(15),
      vdoc_tqe VARCHR(20),
      vdoc_depto VARCHR(20),
      vdoc_depto_medidor VARCHR(20),
      vdoc_servicio VARCHR(20),
      vdoc_alm VARCHR(15),
      vdoc_plazo INT NOT NULL,
      vdoc_pp_dsc1 FLOAT NOT NULL,
      vdoc_pp_dsc2 FLOAT NOT NULL,
      vdoc_pp_dsc3 FLOAT NOT NULL,
      vdoc_pp_dia1 INT NOT NULL,
      vdoc_pp_dia2 INT NOT NULL,
      vdoc_pp_dia3 INT NOT NULL,
      vdoc_regs INT NOT NULL,
      vdoc_cant FLOAT NOT NULL,
      vdoc_suma FLOAT NOT NULL,
      vdoc_descto FLOAT NOT NULL,
      vdoc_grav FLOAT NOT NULL,
      vdoc_iva FLOAT NOT NULL,
      vdoc_total FLOAT NOT NULL,
      vdoc_ant FLOAT NOT NULL,
      vdoc_pag FLOAT NOT NULL,
      vdoc_dev FLOAT NOT NULL,
      vdoc_cia INT NOT NULL,
      vdoc_usu INT NOT NULL,
      vdoc_stat VARCHR(1),
      vdoc_f_sys DATE,
      vdoc_hra_rep TIME,
      vdoc_uuid VARCHR(50),
      PRIMARY KEY (vdoc_ope, vdoc_fol)
    );

    CREATE TABLE IF NOT EXISTS venren (
      vren_ope INT NOT NULL,
      vren_fol VARCHR(25) NOT NULL,
      vren_pos INT NOT NULL,
      vren_ope_aux INT,
      vren_fol_aux VARCHR(25),
      vren_fch DATE,
      vren_cli VARCHR(15),
      vren_edi VARCHR(15),
      vren_tqe VARCHR(20),
      vren_depto VARCHR(20),
      vren_depto_medidor VARCHR(20),
      vren_servicio VARCHR(20),
      vren_alm VARCHR(15),
      vren_art VARCHR(25),
      vren_clf VARCHR(10),
      vren_pre FLOAT NOT NULL,
      vren_descto FLOAT NOT NULL,
      vren_grav FLOAT NOT NULL,
      vren_iva FLOAT NOT NULL,
      vren_total FLOAT NOT NULL,
      vren_usu INT NOT NULL,
      vren_stat VARCHR(1),
      vren_uuid VARCHR(50),
      PRIMARY KEY (vren_ope, vren_fol, vren_pos)
    );

    CREATE TABLE IF NOT EXISTS invalm (
      alm_llave VARCHR(15) PRIMARY KEY,
      alm_marca VARCHR(50),
      alm_modelo VARCHR(10),
      alm_año VARCHR(5),
      alm_capacidad FLOAT NOT NULL,
      alm_f_alt DATE,
      alm_f_mod DATE
    );
    
    CREATE TABLE IF NOT EXISTS catmban (
      bcat_ope INT NOT NULL PRIMARY KEY,
      bcat_desc VARCHR(20),
      bcat_abrev VARCHR(2),
      bcat_tipo VARCHR(1),
      bcat_folio VARCHR(15)
    );
    
    CREATE TABLE IF NOT EXISTS catmcom (
      ccat_ope INT NOT NULL PRIMARY KEY,
      ccat_desc VARCHR(20),
      ccat_abrev VARCHR(2),
      ccat_tipo VARCHR(1),
      ccat_folio VARCHR(15)
    );
    
    CREATE TABLE IF NOT EXISTS catminv (
      icat_ope INT NOT NULL PRIMARY KEY,
      icat_desc VARCHR(20),
      icat_abrev VARCHR(2),
      icat_tipo VARCHR(1),
      icat_folio VARCHR(15)
    );
    
    CREATE TABLE IF NOT EXISTS catmven (
      vcat_ope INT NOT NULL PRIMARY KEY,
      vcat_desc VARCHR(20),
      vcat_abrev VARCHR(2),
      vcat_tipo VARCHR(1),
      vcat_folio VARCHR(15)
    );
  
  `);
});

// POST: crear usuario
app.post('/api/users', (req, res) => {
  const name = (req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name is required' });

  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO users (name, created_at) VALUES (?, ?)',
    [name, createdAt],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.status(201).json({ id: this.lastID, name, created_at: createdAt });
    },
  );
});

// GET: listar usuarios
app.get('/api/users', (req, res) => {
  db.all(
    'SELECT id, name, created_at FROM users ORDER BY id DESC',
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.json(rows);
    },
  );
});

// GET: listar clientes
app.get('/api/vencli', (req, res) => {
  db.all(
    'SELECT cli_llave, cli_nombre, cli_calle, cli_colonia, cli_cp, cli_pais, cli_rfc FROM vencli',
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.json(rows);
    },
  );
});

// GET: listar edificios
app.get('/api/venedif', (req, res) => {
  db.all(
    'SELECT edi_cli, edi_llave, edi_nombre, edi_calle, edi_colonia, edi_cp, edi_pais, edi_ruta FROM venedif',
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.json(rows);
    },
  );
});

// GET: listar tanques
app.get('/api/ventanq', (req, res) => {
  db.all(
    'SELECT tqe_cli, tqe_edi, tqe_medidor, tqe_capacidad, tqe_f_alt, tqe_f_mod FROM ventanq',
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.json(rows);
    },
  );
});

// GET: listar deptos
app.get('/api/vendepto', (req, res) => {
  db.all(
    'SELECT dep_cli, dep_edi, dep_tqe, dep_depto, dep_servicio, dep_f_alt, dep_f_mod FROM vendepto',
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.json(rows);
    },
  );
});

// GET: listar auxiliar deptos
app.get('/api/vendeptoaux', (req, res) => {
  db.all(
    'SELECT adep_cli, adep_edi, adep_tqe, adep_depto, adep_depto_medidor, adep_servicio, adep_f_alt, adep_f_mod FROM vendeptoaux',
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      res.json(rows);
    },
  );
});

// GET: contar departamentos por cliente
app.get('/api/clientes/:cli/departamentos/count', (req, res) => {
  const { cli } = req.params;

  db.get(
    `SELECT dep_cli AS cliente, COUNT(*) AS total_departamentos
     FROM vendepto
     WHERE dep_cli = ?
     GROUP BY dep_cli`,
    [cli],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'DB error', details: err.message });
      }
      res.json(row ?? { cliente: cli, total_departamentos: 0 });
    },
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
