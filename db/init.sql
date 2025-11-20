-- Schema for CRM (based on your spec)
CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE IF NOT EXISTS crm.estado_cliente (
  id_estado serial PRIMARY KEY,
  nombre_estado character varying(50) NOT NULL,
  descripcion text
);

CREATE TABLE IF NOT EXISTS crm.cliente (
  id_cliente serial PRIMARY KEY,
  nombre character varying(100) NOT NULL,
  apellido character varying(100),
  tipo_documento character varying(20),
  numero_documento character varying(50) UNIQUE,
  email character varying(150) UNIQUE,
  telefono character varying(50),
  direccion text,
  id_estado integer NOT NULL REFERENCES crm.estado_cliente(id_estado)
);

CREATE TABLE IF NOT EXISTS crm.usuario (
  id_usuario serial PRIMARY KEY,
  nombre_usuario character varying(100) NOT NULL,
  email character varying(150) UNIQUE NOT NULL,
  rol character varying(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS crm.producto (
  id_producto serial PRIMARY KEY,
  nombre_producto character varying(150) NOT NULL,
  descripcion text,
  precio_unitario numeric(12,2) NOT NULL,
  stock integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS crm.venta (
  id_venta serial PRIMARY KEY,
  fecha_venta timestamp DEFAULT CURRENT_TIMESTAMP,
  monto_total numeric(12,2) NOT NULL,
  id_cliente integer NOT NULL REFERENCES crm.cliente(id_cliente),
  id_usuario integer NOT NULL REFERENCES crm.usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS crm.detalle_venta (
  id_detalle serial PRIMARY KEY,
  id_venta integer NOT NULL REFERENCES crm.venta(id_venta) ON DELETE CASCADE,
  id_producto integer NOT NULL REFERENCES crm.producto(id_producto),
  cantidad integer NOT NULL,
  precio_unitario numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS crm.soporte (
  id_ticket serial PRIMARY KEY,
  id_cliente integer NOT NULL REFERENCES crm.cliente(id_cliente),
  fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP,
  asunto character varying(150) NOT NULL,
  descripcion text,
  estado_ticket character varying(20) DEFAULT 'Abierto',
  id_usuario integer REFERENCES crm.usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS crm.reporte (
  id_reporte serial PRIMARY KEY,
  nombre_reporte character varying(150) NOT NULL,
  fecha_generacion timestamp DEFAULT CURRENT_TIMESTAMP,
  tipo_reporte character varying(50),
  generado_por integer REFERENCES crm.usuario(id_usuario)
);

-- Sample data
INSERT INTO crm.estado_cliente (nombre_estado, descripcion) VALUES
('Activo','Cliente activo'), ('Inactivo','Cliente inactivo')
ON CONFLICT DO NOTHING;

INSERT INTO crm.usuario (nombre_usuario, email, rol) VALUES
('Admin','admin@example.com','admin'),
('Vendedor','vendedor@example.com','vendedor')
ON CONFLICT DO NOTHING;

INSERT INTO crm.producto (nombre_producto, descripcion, precio_unitario, stock) VALUES
('Producto A','Descripción A',100.00,10),
('Producto B','Descripción B',50.00,20)
ON CONFLICT DO NOTHING;

-- Note: add clientes and ventas after creating clients
