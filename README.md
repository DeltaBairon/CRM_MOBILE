# CRM Project (minimal)

## Requirements
- Node.js (14+)
- PostgreSQL

## Setup
1. Create a PostgreSQL database, e.g. `crm`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` (postgres connection string)
3. Run the SQL to create schema and sample data:
   - `psql <your_connection_string> -f db/init.sql`
   or connect with a client and run `db/init.sql`
4. Install dependencies:
   - `npm install`
5. Start server:
   - `npm start`
6. Open browser at http://localhost:3000

APIs:
- GET/POST/PUT/DELETE `/api/clientes`
- GET/POST/PUT/DELETE `/api/productos`
- GET/POST/PUT/DELETE `/api/usuarios`
- GET/POST/PUT/DELETE `/api/estado_cliente`
- GET/POST/PUT/DELETE `/api/soporte`
- GET/POST/PUT/DELETE `/api/reporte`
- GET/POST/PUT/DELETE `/api/ventas`
- GET/POST/PUT/DELETE `/api/detalle_venta`

Frontend is a minimal single-page app in `public/` using fetch().
# CRM_MOBILE
