// public/app.js
const app = document.getElementById('app');
const title = document.getElementById('title');

// ⚠️ IMPORTANTE: Cambia esta URL cuando subas tu backend a un servidor
// Para desarrollo local déjalo vacío: ''
// Para producción pon tu URL: 'https://tu-servidor.com'
const API_BASE = '';

document.querySelectorAll('aside nav button').forEach(b=>{
  b.addEventListener('click', ()=> navigate(b.dataset.view));
});

function navigate(view){
  title.textContent = view.charAt(0).toUpperCase() + view.slice(1);
  if(view==='inicio') return renderInicio();
  if(view==='clientes') return renderClientes();
  if(view==='productos') return renderProductos();
  if(view==='ventas') return renderVentas();
  if(view==='soporte') return renderSoporte();
  if(view==='usuarios') return renderUsuarios();
}

/* ---------- Inicio ---------- */
async function renderInicio(){
  app.innerHTML = `
    <div class="card">
      <h3>Resumen rápido</h3>
      <div id="summary"></div>
    </div>

    <div class="card" style="margin-top:20px">
      <h3>Dashboard de Ventas - Looker Studio</h3>
      <iframe width="100%" height="800"
        src="https://lookerstudio.google.com/embed/reporting/5bb2e2b8-bee6-4d98-a867-e064bf7e4537/page/UWSfF"
        frameborder="0" style="border:0"
        allowfullscreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
      </iframe>
    </div>
  `;

  const [c,p] = await Promise.all([
    fetch(API_BASE + '/api/clientes').then(r=>r.json()),
    fetch(API_BASE + '/api/productos').then(r=>r.json())
  ]);

  document.getElementById('summary').innerHTML =
    `<p>Clientes: ${c.length} | Productos: ${p.length}</p>`;
}


/* ---------- Clientes ---------- */
async function renderClientes(){
  app.innerHTML = '<div class="card"><h3>Clientes</h3><div id="list"></div><div id="form"></div></div>';
  const estados = await fetch(API_BASE + '/api/estado_cliente').then(r=>r.json());
  const clientes = await fetch(API_BASE + '/api/clientes').then(r=>r.json());
  const list = document.getElementById('list');
  list.innerHTML = '<table><thead><tr><th>Id</th><th>Nombre</th><th>Email</th><th>Estado</th><th></th></tr></thead><tbody>' +
    clientes.map(c=>`<tr><td>${c.id_cliente}</td><td>${c.nombre} ${c.apellido||''}</td><td>${c.email||''}</td><td>${c.nombre_estado||c.estado||''}</td>
    <td>
      <button onclick="showEditCliente(${c.id_cliente})" class="btn">Editar</button>
      <button onclick="deleteCliente(${c.id_cliente})" class="btn">Eliminar</button>
    </td></tr>`).join('') +
    '</tbody></table>';
  const form = document.getElementById('form');
  form.innerHTML = `<h4>Crear cliente</h4>
    <form id="clienteForm">
      <input name="nombre" placeholder="Nombre" required />
      <input name="apellido" placeholder="Apellido" required />
      <input name="tipo_documento" placeholder="Tipo documento" />
      <input name="numero_documento" placeholder="Número documento" />
      <input name="email" placeholder="Email" />
      <input name="telefono" placeholder="Teléfono" />
      <input name="direccion" placeholder="Dirección" />
      <select name="id_estado">${estados.map(e=>`<option value="${e.id_estado}">${e.nombre_estado}</option>`)}</select>
      <button class="btn" type="submit">Crear</button>
    </form>
    <div id="editArea"></div>`;

  document.getElementById('clienteForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    body.id_estado = Number(body.id_estado);
    const res = await fetch(API_BASE + '/api/clientes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if(res.ok) renderClientes();
    else {
      const err = await res.json().catch(()=>({error:'error'}));
      alert('Error: '+(err.error||''));
    }
  });
}

window.showEditCliente = async (id) => {
  const cliente = await fetch(API_BASE + '/api/clientes/'+id).then(r=>r.json());
  const estados = await fetch(API_BASE + '/api/estado_cliente').then(r=>r.json());
  const editArea = document.getElementById('editArea');
  editArea.innerHTML = `<h4>Editar cliente ${id}</h4>
    <form id="editForm">
      <input name="nombre" value="${cliente.nombre||''}" required />
      <input name="apellido" value="${cliente.apellido||''}" required />
      <input name="tipo_documento" value="${cliente.tipo_documento||''}" />
      <input name="numero_documento" value="${cliente.numero_documento||''}" />
      <input name="email" value="${cliente.email||''}" />
      <input name="telefono" value="${cliente.telefono||''}" />
      <input name="direccion" value="${cliente.direccion||''}" />
      <select name="id_estado">${estados.map(e=>`<option value="${e.id_estado}" ${cliente.id_estado==e.id_estado?'selected':''}>${e.nombre_estado}</option>`)}</select>
      <button class="btn" type="submit">Guardar</button>
      <button type="button" onclick="renderClientes()">Cancelar</button>
    </form>`;
  document.getElementById('editForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    body.id_estado = Number(body.id_estado);
    const res = await fetch(API_BASE + '/api/clientes/'+id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if(res.ok) renderClientes();
    else {
      const err = await res.json().catch(()=>({error:'error'}));
      alert('Error: '+(err.error||''));
    }
  });
}

window.deleteCliente = async (id) => {
  if(!confirm('Eliminar?')) return;
  await fetch(API_BASE + '/api/clientes/'+id,{method:'DELETE'});
  renderClientes();
}

/* ---------- Productos ---------- */
async function renderProductos(){
  app.innerHTML = '<div class="card"><h3>Productos</h3><div id="list"></div><div id="form"></div></div>';
  const productos = await fetch(API_BASE + '/api/productos').then(r=>r.json());
  document.getElementById('list').innerHTML = '<table><thead><tr><th>Id</th><th>Nombre</th><th>Precio</th><th>Stock</th><th></th></tr></thead><tbody>' +
    productos.map(p=>`<tr><td>${p.id_producto}</td><td>${p.nombre_producto}</td><td>${p.precio_unitario}</td><td>${p.stock}</td>
    <td><button onclick="deleteProducto(${p.id_producto})" class="btn">Eliminar</button></td></tr>`).join('') +
    '</tbody></table>';
  const form = document.getElementById('form');
  form.innerHTML = `<h4>Crear producto</h4>
    <form id="productoForm">
      <input name="nombre_producto" placeholder="Nombre" required />
      <input name="descripcion" placeholder="Descripción" />
      <input name="precio_unitario" placeholder="Precio" required type="number" step="0.01" />
      <input name="stock" placeholder="Stock" type="number" />
      <button class="btn" type="submit">Crear</button>
    </form>`;
  document.getElementById('productoForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    body.precio_unitario = Number(body.precio_unitario);
    body.stock = Number(body.stock||0);
    const res = await fetch(API_BASE + '/api/productos',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if(res.ok) renderProductos(); else alert('Error');
  });
}

window.deleteProducto = async (id) => {
  if(!confirm('Eliminar?')) return;
  await fetch(API_BASE + '/api/productos/'+id,{method:'DELETE'});
  renderProductos();
}

/* ---------- Ventas ---------- */
async function renderVentas() {
  app.innerHTML = `
    <div class="card">
      <h3>Ventas</h3>
      <div id="list"></div>
      <div id="form"></div>
    </div>
  `;

  const ventas = await fetch(API_BASE + '/api/ventas').then(r => r.json());
  const clientes = await fetch(API_BASE + '/api/clientes').then(r => r.json());
  const usuarios = await fetch(API_BASE + '/api/usuarios').then(r => r.json());
  const productos = await fetch(API_BASE + '/api/productos').then(r => r.json());

  document.getElementById("list").innerHTML =
    `<table>
      <thead>
        <tr><th>Id</th><th>Monto</th><th>Cliente</th><th>Usuario</th></tr>
      </thead>
      <tbody>
        ${ventas.map(v =>
          `<tr>
            <td>${v.id_venta}</td>
            <td>${v.monto_total}</td>
            <td>${v.id_cliente}</td>
            <td>${v.id_usuario}</td>
          </tr>`
        ).join("")}
      </tbody>
    </table>`;

  document.getElementById("form").innerHTML = `
    <h4>Crear venta</h4>
    <form id="ventaForm">

      <label>Cliente</label>
      <select name="id_cliente" required>
        ${clientes.map(c => `<option value="${c.id_cliente}">${c.nombre} ${c.apellido || ''}</option>`)}
      </select>

      <label>Usuario</label>
      <select name="id_usuario" required>
        ${usuarios.map(u => `<option value="${u.id_usuario}">${u.nombre_usuario}</option>`)}
      </select>

      <h4>Agregar productos</h4>
      <div id="productosContainer"></div>

      <button type="button" class="btn" id="addProducto">+ Agregar producto</button>

      <h4>Total: <span id="totalVenta">0</span></h4>

      <button class="btn" type="submit">Crear venta</button>
    </form>
  `;

  let detalles = [];

  const productosContainer = document.getElementById("productosContainer");

  function renderProductosLista() {
    productosContainer.innerHTML = detalles.map((d, i) => `
      <div class="producto-item">
        <select data-i="${i}" class="prodSelect">
          ${productos.map(p => `
            <option value="${p.id_producto}" ${p.id_producto == d.id_producto ? "selected" : ""}>
              ${p.nombre_producto}
            </option>`).join("")}
        </select>

        <input type="number" min="1" data-i="${i}" class="cantidadInput" value="${d.cantidad}">
        <span> Precio: ${d.precio_unitario} </span>
        <button type="button" data-i="${i}" class="btn deleteProd">X</button>
      </div>
    `).join("");

    updateTotal();
  }

  function updateTotal() {
    const total = detalles.reduce((s, d) => s + d.cantidad * d.precio_unitario, 0);
    document.getElementById("totalVenta").textContent = total;
  }

  document.getElementById("addProducto").addEventListener("click", () => {
    const first = productos[0];
    detalles.push({
      id_producto: first.id_producto,
      cantidad: 1,
      precio_unitario: Number(first.precio_unitario)
    });
    renderProductosLista();
  });

  productosContainer.addEventListener("change", (e) => {
    const i = e.target.dataset.i;
    const prodId = Number(document.querySelectorAll(".prodSelect")[i].value);
    const cantidad = Number(document.querySelectorAll(".cantidadInput")[i].value);

    const prod = productos.find(p => p.id_producto == prodId);

    detalles[i] = {
      id_producto: prod.id_producto,
      cantidad,
      precio_unitario: Number(prod.precio_unitario)
    };

    renderProductosLista();
  });

  productosContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("deleteProd")) {
      const i = e.target.dataset.i;
      detalles.splice(i, 1);
      renderProductosLista();
    }
  });

  document.getElementById("ventaForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (detalles.length === 0) {
      alert("Debe agregar al menos un producto");
      return;
    }

    const fd = new FormData(e.target);

    const payload = {
      id_cliente: Number(fd.get("id_cliente")),
      id_usuario: Number(fd.get("id_usuario")),
      detalles,
      monto_total: detalles.reduce((s, d) => s + d.cantidad * d.precio_unitario, 0)
    };

    const res = await fetch(API_BASE + "/api/ventas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) renderVentas();
    else alert("Error al crear la venta");
  });
}

/* ---------- Soporte ---------- */
async function renderSoporte(){
  app.innerHTML = '<div class="card"><h3>Soporte</h3><div id="list"></div><div id="form"></div></div>';
  const tickets = await fetch(API_BASE + '/api/soporte').then(r=>r.json());
  const clientes = await fetch(API_BASE + '/api/clientes').then(r=>r.json());
  document.getElementById('list').innerHTML = '<table><thead><tr><th>Id</th><th>Cliente</th><th>Asunto</th><th>Estado</th></tr></thead><tbody>' +
    tickets.map(t=>`<tr><td>${t.id_ticket}</td><td>${t.id_cliente}</td><td>${t.asunto}</td><td>${t.estado_ticket}</td></tr>`).join('') + '</tbody></table>';
  const form = document.getElementById('form');
  form.innerHTML = `<h4>Crear ticket</h4>
    <form id="soporteForm">
      <select name="id_cliente">${clientes.map(c=>`<option value="${c.id_cliente}">${c.nombre} ${c.apellido||''}</option>`)}</select>
      <input name="asunto" required placeholder="Asunto"/>
      <textarea name="descripcion" rows="3" style="width:100%"></textarea>
      <button class="btn" type="submit">Crear</button>
    </form>`;
  document.getElementById('soporteForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch(API_BASE + '/api/soporte',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body, id_cliente: Number(body.id_cliente)})});
    if(res.ok) renderSoporte(); else alert('Error');
  });
}

/* ---------- Usuarios ---------- */
async function renderUsuarios(){
  app.innerHTML = '<div class="card"><h3>Usuarios</h3><div id="list"></div><div id="form"></div></div>';
  const usuarios = await fetch(API_BASE + '/api/usuarios').then(r=>r.json());
  document.getElementById('list').innerHTML = '<table><thead><tr><th>Id</th><th>Nombre</th><th>Email</th></tr></thead><tbody>' +
    usuarios.map(u=>`<tr><td>${u.id_usuario}</td><td>${u.nombre_usuario}</td><td>${u.email}</td></tr>`).join('') + '</tbody></table>';
  const form = document.getElementById('form');
  form.innerHTML = `<h4>Crear usuario</h4>
    <form id="usuarioForm">
      <input name="nombre_usuario" placeholder="Nombre" required />
      <input name="email" placeholder="Email" required />
      <input name="rol" placeholder="Rol" required />
      <button class="btn" type="submit">Crear</button>
    </form>`;
  document.getElementById('usuarioForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch(API_BASE + '/api/usuarios',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if(res.ok) renderUsuarios(); else alert('Error');
  });
}

/* init */
navigate('inicio');