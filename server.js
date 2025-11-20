// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js"; // uses DB_* vars and sets search_path to crm

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const api = express.Router();

const wrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Endpoint error:", err);
    const code = err && err.code ? 500 : 500;
    res.status(code).json({ error: err.message || String(err) });
  });
};

/* -------------------- estado_cliente -------------------- */
api.get("/estado_cliente", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM estado_cliente ORDER BY id_estado");
  res.json(rows);
}));

api.post("/estado_cliente", wrap(async (req, res) => {
  const { nombre_estado, descripcion } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO estado_cliente (nombre_estado, descripcion) VALUES ($1,$2) RETURNING *",
    [nombre_estado, descripcion]
  );
  res.status(201).json(rows[0]);
}));

api.put("/estado_cliente/:id", wrap(async (req, res) => {
  const id = req.params.id;
  const { nombre_estado, descripcion } = req.body;
  const { rows } = await pool.query(
    "UPDATE estado_cliente SET nombre_estado=$1, descripcion=$2 WHERE id_estado=$3 RETURNING *",
    [nombre_estado, descripcion, id]
  );
  res.json(rows[0]);
}));

api.delete("/estado_cliente/:id", wrap(async (req, res) => {
  await pool.query("DELETE FROM estado_cliente WHERE id_estado=$1", [req.params.id]);
  res.json({ deleted: true });
}));

/* -------------------- cliente -------------------- */
/* Columns (per your schema):
   id_cliente, nombre, apellido, tipo_documento, numero_documento,
   email, telefono, direccion, id_estado (NOT NULL)
*/
api.get("/clientes", wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, e.nombre_estado
     FROM cliente c
     LEFT JOIN estado_cliente e ON c.id_estado = e.id_estado
     ORDER BY c.id_cliente`
  );
  res.json(rows);
}));

api.get("/clientes/:id", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM cliente WHERE id_cliente=$1", [req.params.id]);
  res.json(rows[0] || null);
}));

api.post("/clientes", wrap(async (req, res) => {
  // Expect fields according to your schema (we allow missing optional fields)
  const {
    nombre, apellido, tipo_documento, numero_documento,
    email, telefono, direccion, id_estado
  } = req.body;

  // id_estado is NOT NULL in your schema -> ensure present or reject
  if (!id_estado) {
    return res.status(400).json({ error: "id_estado es requerido" });
  }

  const { rows } = await pool.query(
    `INSERT INTO cliente 
     (nombre, apellido, tipo_documento, numero_documento, email, telefono, direccion, id_estado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [nombre || null, apellido || null, tipo_documento || null, numero_documento || null, email || null, telefono || null, direccion || null, id_estado]
  );
  res.status(201).json(rows[0]);
}));

api.put("/clientes/:id", wrap(async (req, res) => {
  const id = req.params.id;
  const {
    nombre, apellido, tipo_documento, numero_documento,
    email, telefono, direccion, id_estado
  } = req.body;

  if (!id_estado) {
    return res.status(400).json({ error: "id_estado es requerido" });
  }

  const { rows } = await pool.query(
    `UPDATE cliente SET
       nombre=$1, apellido=$2, tipo_documento=$3, numero_documento=$4,
       email=$5, telefono=$6, direccion=$7, id_estado=$8
     WHERE id_cliente=$9 RETURNING *`,
    [nombre || null, apellido || null, tipo_documento || null, numero_documento || null, email || null, telefono || null, direccion || null, id_estado, id]
  );
  res.json(rows[0]);
}));

api.delete("/clientes/:id", wrap(async (req, res) => {
  await pool.query("DELETE FROM cliente WHERE id_cliente=$1", [req.params.id]);
  res.json({ deleted: true });
}));

/* -------------------- usuario -------------------- */
api.get("/usuarios", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM usuario ORDER BY id_usuario");
  res.json(rows);
}));

api.post("/usuarios", wrap(async (req, res) => {
  const { nombre_usuario, email, rol } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO usuario (nombre_usuario, email, rol) VALUES ($1,$2,$3) RETURNING *",
    [nombre_usuario, email, rol]
  );
  res.status(201).json(rows[0]);
}));

api.put("/usuarios/:id", wrap(async (req, res) => {
  const { nombre_usuario, email, rol } = req.body;
  const { rows } = await pool.query(
    "UPDATE usuario SET nombre_usuario=$1, email=$2, rol=$3 WHERE id_usuario=$4 RETURNING *",
    [nombre_usuario, email, rol, req.params.id]
  );
  res.json(rows[0]);
}));

api.delete("/usuarios/:id", wrap(async (req, res) => {
  await pool.query("DELETE FROM usuario WHERE id_usuario=$1", [req.params.id]);
  res.json({ deleted: true });
}));

/* -------------------- producto -------------------- */
api.get("/productos", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM producto ORDER BY id_producto");
  res.json(rows);
}));

api.post("/productos", wrap(async (req, res) => {
  const { nombre_producto, descripcion, precio_unitario, stock } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO producto (nombre_producto, descripcion, precio_unitario, stock) VALUES ($1,$2,$3,$4) RETURNING *",
    [nombre_producto, descripcion || null, precio_unitario, stock || 0]
  );
  res.status(201).json(rows[0]);
}));

api.put("/productos/:id", wrap(async (req, res) => {
  const { nombre_producto, descripcion, precio_unitario, stock } = req.body;
  const { rows } = await pool.query(
    "UPDATE producto SET nombre_producto=$1, descripcion=$2, precio_unitario=$3, stock=$4 WHERE id_producto=$5 RETURNING *",
    [nombre_producto, descripcion || null, precio_unitario, stock || 0, req.params.id]
  );
  res.json(rows[0]);
}));

api.delete("/productos/:id", wrap(async (req, res) => {
  await pool.query("DELETE FROM producto WHERE id_producto=$1", [req.params.id]);
  res.json({ deleted: true });
}));

/* -------------------- ventas y detalle -------------------- */
/* ventas: id_venta, fecha_venta, monto_total, id_cliente, id_usuario
   detalle_venta: id_detalle, id_venta, id_producto, cantidad, precio_unitario, subtotal
*/
api.get("/ventas", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM venta ORDER BY id_venta");
  res.json(rows);
}));

api.get("/ventas/:id", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM venta WHERE id_venta=$1", [req.params.id]);
  res.json(rows[0] || null);
}));

// Crear venta con detalles y monto automático
/* -------------------- crear venta -------------------- */
api.post("/ventas", wrap(async (req, res) => {
  const { id_cliente, id_usuario, detalles } = req.body;

  if (!id_cliente || !id_usuario || !Array.isArray(detalles)) {
    return res.status(400).json({ error: "Datos incompletos para crear una venta." });
  }

  // Calcular monto total
  let monto_total = 0;
  for (const d of detalles) {
    if (!d.id_producto || !d.cantidad || !d.precio_unitario) {
      return res.status(400).json({
        error: "Cada detalle debe incluir id_producto, cantidad y precio_unitario."
      });
    }
    monto_total += d.cantidad * d.precio_unitario;
  }

  // Crear venta en tabla VENTA (sin la S)
  const venta = await pool.query(
    `INSERT INTO venta (id_cliente, id_usuario, monto_total, fecha_venta)
     VALUES ($1, $2, $3, NOW())
     RETURNING id_venta`,
    [id_cliente, id_usuario, monto_total]
  );

  const id_venta = venta.rows[0].id_venta;

  // Insertar detalles en DETALLE_VENTA (sin la S)
  for (const d of detalles) {
    await pool.query(
      `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        id_venta,
        d.id_producto,
        d.cantidad,
        d.precio_unitario,
        d.cantidad * d.precio_unitario
      ]
    );
  }

  res.json({ message: "Venta creada con éxito", id_venta });
}));




api.get("/detalle_venta", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM detalle_venta ORDER BY id_detalle");
  res.json(rows);
}));

/* -------------------- soporte -------------------- */
api.get("/soporte", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM soporte ORDER BY id_ticket");
  res.json(rows);
}));

api.post("/soporte", wrap(async (req, res) => {
  const { id_cliente, asunto, descripcion, estado_ticket, id_usuario } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO soporte (id_cliente, asunto, descripcion, estado_ticket, id_usuario) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [id_cliente, asunto, descripcion || null, estado_ticket || "Abierto", id_usuario || null]
  );
  res.status(201).json(rows[0]);
}));

api.put("/soporte/:id", wrap(async (req, res) => {
  const { asunto, descripcion, estado_ticket, id_usuario } = req.body;
  const { rows } = await pool.query(
    "UPDATE soporte SET asunto=$1, descripcion=$2, estado_ticket=$3, id_usuario=$4 WHERE id_ticket=$5 RETURNING *",
    [asunto, descripcion || null, estado_ticket || null, id_usuario || null, req.params.id]
  );
  res.json(rows[0]);
}));

api.delete("/soporte/:id", wrap(async (req, res) => {
  await pool.query("DELETE FROM soporte WHERE id_ticket=$1", [req.params.id]);
  res.json({ deleted: true });
}));

/* -------------------- reportes -------------------- */
api.get("/reportes", wrap(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM reporte ORDER BY id_reporte");
  res.json(rows);
}));

api.post("/reportes", wrap(async (req, res) => {
  const { nombre_reporte, tipo_reporte, generado_por } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO reporte (nombre_reporte, tipo_reporte, generado_por) VALUES ($1,$2,$3) RETURNING *",
    [nombre_reporte, tipo_reporte, generado_por || null]
  );
  res.status(201).json(rows[0]);
}));

api.delete("/reportes/:id", wrap(async (req, res) => {
  await pool.query("DELETE FROM reporte WHERE id_reporte=$1", [req.params.id]);
  res.json({ deleted: true });
}));

/* mount api */
app.use("/api", api);

/* SPA fallback (serve index.html) */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* start */
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`));
