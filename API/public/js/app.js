// ========================== HELPERS DE VISTAS ==========================
function mostrarLogin() {
  const viewLogin = document.getElementById("view-login");
  const mainLayout = document.getElementById("main-layout");

  if (viewLogin) viewLogin.classList.remove("d-none");
  if (mainLayout) mainLayout.classList.add("d-none");
}

function mostrarDashboard() {
  const viewLogin = document.getElementById("view-login");
  const mainLayout = document.getElementById("main-layout");

  if (viewLogin) viewLogin.classList.add("d-none");
  if (mainLayout) mainLayout.classList.remove("d-none");
}

// ========================== INICIO / RECARGA ==========================
// NO CARGA DASHBOARD AUTOMÁTICO
window.addEventListener("DOMContentLoaded", () => {
  const usuarioStr = localStorage.getItem("novamarket_usuario");

  if (usuarioStr) {
    mostrarDashboard();
  } else {
    mostrarLogin();
  }
});

// ========================== LOGIN ==========================
const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("login-usuario").value;

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        return;
      }

      // GUARDAR SESIÓN
      localStorage.setItem("novamarket_usuario", JSON.stringify(data.usuario));

      // MOSTRAR ROL
      const rolSpan = document.getElementById("navbar-rol-actual");
      if (rolSpan) {
        rolSpan.textContent = data.usuario.ROL;
      }

      // CAMBIAR A DASHBOARD
      mostrarDashboard();

      // CARGAR DASHBOARD AHORA SÍ
      if (typeof cargarDashboard === "function") {
        cargarDashboard();
      }

      alert("Bienvenido " + data.usuario.NOMBRE);

    } catch (err) {
      console.error(err);
      alert("ERROR AL CONECTAR CON EL SERVIDOR");
    }
  });
}

// ========================== LOGOUT ==========================
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("novamarket_usuario");
    mostrarLogin();
  });
}

// =====================================================
// CONTROLADOR DE VISTAS (SIDEBAR)
// =====================================================

function mostrarVista(vistaID) {
  // Ocultar TODAS las vistas
  document.querySelectorAll(".view-section").forEach(v => {
    v.classList.remove("active");
    v.classList.add("d-none");
  });

  // Quitar selección del menú
  document.querySelectorAll(".sidebar-item").forEach(btn => {
    btn.classList.remove("active");
  });

  // Mostrar vista seleccionada
  const vista = document.getElementById(`view-${vistaID}`);
  if (vista) {
    vista.classList.remove("d-none");
    vista.classList.add("active");
  }

  // Activar botón del menú
  const boton = document.querySelector(`[data-view="${vistaID}"]`);
  if (boton) {
    boton.classList.add("active");
  }

  // Cargar datos si corresponde
  if (vistaID === "dashboard" && typeof cargarDashboard === "function") {
    cargarDashboard();
  }
  if (vistaID === "puestos" && typeof cargarPuestos === "function") {
    cargarPuestos();
  }
  if (vistaID === "usuarios" && typeof cargarUsuarios === "function") {
    cargarUsuarios();
  }
  if (vistaID === "estados" && typeof cargarEstados === "function") {
    cargarEstados();
  }

  if (vistaID === "provincias" && typeof cargarProvincias === "function") {
    cargarProvincias();
  }


}


// =====================================================
// EVENTOS DEL SIDEBAR
// =====================================================
document.querySelectorAll(".sidebar-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const vista = btn.getAttribute("data-view");
    mostrarVista(vista);
  });
});


// =========================================
// DASHBOARD (DATOS REALES)
// =========================================

async function cargarDashboard() {
  const usuarioStr = localStorage.getItem("novamarket_usuario");

  if (!usuarioStr) {
    mostrarLogin();
    return;
  }

  const usuario = JSON.parse(usuarioStr);
  const idEmpleado = usuario.ID_USUARIO;

  try {
    // === TOTAL CLIENTES ===
    const usuariosRes = await fetch("http://localhost:5000/api/dashboard/total-clientes");
    const usuariosData = await usuariosRes.json();
    document.getElementById("card-total-usuarios").textContent =
      usuariosData.TOTAL_CLIENTES ?? 0;

    // === TOTAL PRODUCTOS ===
    const productosRes = await fetch("http://localhost:5000/api/dashboard/total-productos");
    const productosData = await productosRes.json();
    document.getElementById("card-total-productos").textContent =
      productosData.TOTAL_PRODUCTOS ?? 0;

    // === TOTAL VENTAS ===
    const ventasRes = await fetch("http://localhost:5000/api/dashboard/total-ventas");
    const ventasData = await ventasRes.json();
    document.getElementById("card-total-ventas").textContent =
      ventasData.TOTAL_VENTAS ?? 0;

    // === ÚLTIMAS FACTURAS (POR EMPLEADO) ===
    const factRes = await fetch(`http://localhost:5000/api/dashboard/facturas/${idEmpleado}`);
    const factData = await factRes.json();

    const tbody = document.getElementById("tabla-dashboard-facturas");
    tbody.innerHTML = "";

    if (factData.facturas) {
      factData.facturas.forEach(f => {
        tbody.innerHTML += `
          <tr>
            <td>${f[0]}</td>
            <td>${f[1]}</td>
            <td>${f[2]}</td>
            <td>₡${f[3]}</td>
          </tr>
        `;
      });
    }

  } catch (err) {
    console.error("Error cargando dashboard:", err);
  }
}

// =====================================================
//  ESTADOS – CRUD REST
// =====================================================

// Cargar tabla de estados
async function cargarEstados() {
  try {
    const res = await fetch("http://localhost:5000/api/estados");
    const data = await res.json();

    console.log("DATA ESTADOS:", data);   // 👈 AGREGA ESTO

    const tbody = document.getElementById("tabla-estados");
    tbody.innerHTML = "";

    data.estados.forEach(e => {
      tbody.innerHTML += `
        <tr>
          <td>${e[0]}</td>
          <td>${e[1]}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2" onclick="editarEstado(${e[0]}, '${e[1]}')">
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarEstado(${e[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error cargando estados:", err);
  }
}

// Abrir modal para editar
function editarEstado(id, nombre) {
  document.getElementById("estado-id").value = id;
  document.getElementById("estado-nombre").value = nombre;
  new bootstrap.Modal(document.getElementById("modal-estado")).show();
}


// Guardar (INSERT o UPDATE)
document.getElementById("form-estado").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("estado-id").value;
  const nombre = document.getElementById("estado-nombre").value;

  const dataToSend = { nombre };

  try {
    let res;

    if (!id) {
      // INSERTAR → POST
      res = await fetch("http://localhost:5000/api/estados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
    } else {
      // ACTUALIZAR → PUT
      res = await fetch(`http://localhost:5000/api/estados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
    }

    const data = await res.json();
    if (!data.success) return alert("Error: " + data.error);

    bootstrap.Modal.getInstance(document.getElementById("modal-estado")).hide();
    cargarEstados();

  } catch (err) {
    console.error(err);
  }
});


// DELETE LÓGICO → PUT o DELETE (aquí será DELETE REST)
async function eliminarEstado(id) {
  if (!confirm("¿Seguro que desea inactivar este estado?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/estados/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    if (!data.success) return alert("Error eliminando");

    cargarEstados();

  } catch (err) {
    console.error(err);
  }
}

// =====================================================
//  PUESTOS – CRUD REST
// =====================================================

async function cargarPuestos() {
  try {
    const res = await fetch("http://localhost:5000/api/puestos");
    const data = await res.json();

    // 🔥 LOG IMPORTANTE PARA VER QUÉ RESPONDE EL BACKEND
    console.log("DATA PUESTOS:", data);

    const tbody = document.getElementById("tabla-puestos");
    const selectEstado = document.getElementById("puesto-estado");

    tbody.innerHTML = "";
    selectEstado.innerHTML = "";

    // Cargar estados
    const estadosRes = await fetch("http://localhost:5000/api/estados");
    const estadosData = await estadosRes.json();

    estadosData.estados.forEach(e => {
      selectEstado.innerHTML += `<option value="${e[0]}">${e[1]}</option>`;
    });

    // Cargar tabla de puestos
    data.puestos.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td>${p[0]}</td>
          <td>${p[1]}</td>
          <td>₡${p[2]}</td>
          <td>${p[3]}</td>
          <td>${p[4]}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2"
              onclick="editarPuesto(${p[0]}, '${p[1]}', ${p[2]}, '${p[3]}', ${p[4]})">
              Editar
            </button>
            <button class="btn btn-sm btn-danger"
              onclick="eliminarPuesto(${p[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error cargando puestos:", err);
  }
}


// Abrir modal para editar
function editarPuesto(id, nombre, salario, descripcion, estado) {
  document.getElementById("puesto-id").value = id;
  document.getElementById("puesto-nombre").value = nombre;
  document.getElementById("puesto-salario").value = salario;
  document.getElementById("puesto-descripcion").value = descripcion;
  document.getElementById("puesto-estado").value = estado;

  new bootstrap.Modal(document.getElementById("modal-puesto")).show();
}


// Guardar puesto (INSERT o UPDATE)
document.getElementById("form-puesto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("puesto-id").value;
  const nombre = document.getElementById("puesto-nombre").value;
  const salario = document.getElementById("puesto-salario").value;
  const descripcion = document.getElementById("puesto-descripcion").value;
  const estado = document.getElementById("puesto-estado").value;

  const sendData = { id, nombre, salario, descripcion, estado };

  try {
    let res;

    if (!id) {
      // INSERT → POST
      res = await fetch("http://localhost:5000/api/puestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData)
      });
    } else {
      // UPDATE → PUT
      res = await fetch(`http://localhost:5000/api/puestos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData)
      });
    }

    const data = await res.json();
    if (!data.success) return alert("Error: " + data.error);

    bootstrap.Modal.getInstance(document.getElementById("modal-puesto")).hide();
    cargarPuestos();

  } catch (err) {
    console.error(err);
  }
});


// Inactivar puesto (DELETE lógico)
async function eliminarPuesto(id) {
  if (!confirm("¿Seguro que desea inactivar este puesto?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/puestos/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    if (!data.success) return alert("Error eliminando");

    cargarPuestos();

  } catch (err) {
    console.error(err);
  }
}

// =====================================================
//  PROVINCIAS – CRUD REST
// =====================================================

// Cargar tabla de provincias
async function cargarProvincias() {
  try {
    const res = await fetch("http://localhost:5000/api/provincias");
    const data = await res.json();

    console.log("DATA PROVINCIAS:", data);

    const tbody = document.getElementById("tabla-provincias");
    tbody.innerHTML = "";

    data.provincias.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td>${p[0]}</td>
          <td>${p[1]}</td>
          <td>${p[2] == 1 ? "Activo" : "Inactivo"}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2"
              onclick="editarProvincia(${p[0]}, '${p[1]}', ${p[2]})">
              Editar
            </button>
            <button class="btn btn-sm btn-danger"
              onclick="eliminarProvincia(${p[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

    // Cargar estados en el select del modal
    const selectEstado = document.getElementById("provincia-estado");
    selectEstado.innerHTML = "";

    const estadoRes = await fetch("http://localhost:5000/api/estados");
    const estadoData = await estadoRes.json();

    estadoData.estados.forEach(e => {
      selectEstado.innerHTML += `<option value="${e[0]}">${e[1]}</option>`;
    });

  } catch (err) {
    console.error("Error cargando provincias:", err);
  }
}

function editarProvincia(id, nombre, estado) {
  document.getElementById("provincia-id").value = id;
  document.getElementById("provincia-nombre").value = nombre;
  document.getElementById("provincia-estado").value = estado;

  new bootstrap.Modal(document.getElementById("modal-provincia")).show();
}

document.getElementById("form-provincia").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("provincia-id").value;
  const nombre = document.getElementById("provincia-nombre").value;
  const estado = document.getElementById("provincia-estado").value;

  const dataSend = { nombre, estado };
  let res;

  if (!id) {
    // INSERT
    res = await fetch("http://localhost:5000/api/provincias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  } else {
    // UPDATE
    res = await fetch(`http://localhost:5000/api/provincias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  }

  const data = await res.json();
  if (!data.success) return alert("Error: " + data.error);

  bootstrap.Modal.getInstance(document.getElementById("modal-provincia")).hide();
  cargarProvincias();
});

async function eliminarProvincia(id) {
  if (!confirm("¿Seguro que desea inactivar esta provincia?")) return;

  const res = await fetch(`http://localhost:5000/api/provincias/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (!data.success) return alert("Error eliminando");

  cargarProvincias();
}



// =====================================================
//  CANTONES – CRUD REST + FILTRO POR PROVINCIA
// =====================================================

// Cargar tabla de cantones
// ============================================
// CANTONES – LISTAR TODOS
// ============================================
async function cargarCantones() {
  try {
    const res = await fetch("http://localhost:5000/api/cantones");
    const data = await res.json();

    console.log("CANTONES (todos):", data);

    const tbody = document.getElementById("tabla-cantones");
    tbody.innerHTML = "";

    data.cantones.forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td>${c[0]}</td>
          <td>${c[1]}</td>
          <td>${c[2]}</td> <!-- Provincia -->
          <td>${c[3] == 1 ? "Activo" : "Inactivo"}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2"
              onclick="editarCanton(${c[0]}, '${c[1]}', ${c[4]}, ${c[3]})">
              Editar
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="eliminarCanton(${c[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error cargando cantones:", err);
  }
}

// ============================================
// FILTRAR CANTONES POR PROVINCIA
// ============================================
async function filtrarCantones() {
  const idProvincia = document.getElementById("filtro-provincia").value;

  if (idProvincia == 0) {
    cargarCantones();
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/cantones/provincia/${idProvincia}`);
    const data = await res.json();

    console.log("CANTONES filtrados:", data);

    const tbody = document.getElementById("tabla-cantones");
    tbody.innerHTML = "";

    data.cantones.forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td>${c[0]}</td>
          <td>${c[1]}</td>
          <td>${c[2]}</td> 
          <td>${c[3] == 1 ? "Activo" : "Inactivo"}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2"
              onclick="editarCanton(${c[0]}, '${c[1]}', ${c[4]}, ${c[3]})">
              Editar
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="eliminarCanton(${c[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error filtrando cantones:", err);
  }
}

// ============================================
// RESTABLECER LISTA COMPLETA
// ============================================
function verTodosCantones() {
  cargarCantones();
}

// =====================================================
//  LLENAR SELECTS DEL MODAL
// =====================================================

async function cargarProvinciasModal() {
  const res = await fetch("http://localhost:5000/api/provincias");
  const data = await res.json();

  const select = document.getElementById("canton-provincia");
  select.innerHTML = "";

  if (!data.provincias) return;

  data.provincias.forEach(p => {
    select.innerHTML += `<option value="${p[0]}">${p[1]}</option>`;
  });
}

async function cargarEstadosModal() {
  const res = await fetch("http://localhost:5000/api/estados");
  const data = await res.json();

  const select = document.getElementById("canton-estado");
  select.innerHTML = "";

  data.estados.forEach(e => {
    select.innerHTML += `<option value="${e[0]}">${e[1]}</option>`;
  });
}



// =====================================================
//  FILTRO DE PROVINCIAS (arriba de la tabla)
// =====================================================

async function cargarFiltroProvincias() {
  const res = await fetch("http://localhost:5000/api/provincias");
  const data = await res.json();

  const select = document.getElementById("filtro-provincia");


  data.provincias.forEach(p => {
    select.innerHTML += `<option value="${p[0]}">${p[1]}</option>`;
  });
}

// =====================================================
//  INIT AL CARGAR LA VISTA
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  cargarFiltroProvincias();
  cargarCantones();
});

// =====================================================
//  EDITAR
// =====================================================

function editarCanton(id, nombre, provincia, estado) {
  document.getElementById("canton-id").value = id;
  document.getElementById("canton-nombre").value = nombre;
  document.getElementById("canton-provincia").value = provincia;
  document.getElementById("canton-estado").value = estado;

  new bootstrap.Modal(document.getElementById("modal-canton")).show();

  cargarCantones();
}

// =====================================================
//  INSERTAR / UPDATE
// =====================================================

document.getElementById("form-canton").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("canton-id").value;
  const nombre = document.getElementById("canton-nombre").value;
  const provincia = document.getElementById("canton-provincia").value;
  const estado = document.getElementById("canton-estado").value;

  const dataSend = { nombre, provincia, estado };
  let res;

  if (!id) {
    // INSERT
    res = await fetch("http://localhost:5000/api/cantones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  } else {
    // UPDATE
    res = await fetch(`http://localhost:5000/api/cantones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  }

  const data = await res.json();
  if (!data.success) return alert("Error: " + data.error);

  bootstrap.Modal.getInstance(document.getElementById("modal-canton")).hide();
  cargarCantones();
});

// =====================================================
//  DELETE LÓGICO
// =====================================================

async function eliminarCanton(id) {
  if (!confirm("¿Seguro que desea inactivar este cantón?")) return;

  const res = await fetch(`http://localhost:5000/api/cantones/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (!data.success) return alert("Error eliminando");

  cargarCantones();
}

// =====================================================
//  CARGAR SELECTS CUANDO SE ABRE EL MODAL
// =====================================================

const modalCanton = document.getElementById("modal-canton");

modalCanton.addEventListener("show.bs.modal", async () => {
  await cargarProvinciasModal();
  await cargarEstadosModal();
});

// =====================================================
// FILTRO DE CANTONES
// =====================================================

async function cargarFiltroCantones() {
  const res = await fetch("http://localhost:5000/api/cantones");
  const data = await res.json();

  const select = document.getElementById("filtro-canton");
  select.innerHTML = `<option value="0">Todos</option>`;

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });

  select.onchange = () => filtrarDistritos(select.value);
}





// =====================================================
//  DISTRITOS – CRUD REST + FILTRO POR CANTÓN
// =====================================================

// ============================================
// DISTRITOS – LISTAR TODOS
// ============================================

async function cargarDistritos() {
  try {
    const res = await fetch("http://localhost:5000/api/distritos");
    const data = await res.json();

    console.log("DISTRITOS (todos):", data);

    const tbody = document.getElementById("tabla-distritos");
    tbody.innerHTML = "";

    if (!data.distritos) return;

    // SP: ID_DISTRITO, NOMBRE_DISTRITO, NOMBRE_CANTON, ID_ESTADO, ID_CANTON
    data.distritos.forEach(d => {
      tbody.innerHTML += `
        <tr>
          <td>${d[0]}</td>
          <td>${d[1]}</td>
          <td>${d[2]}</td> 
          <td>${d[3] == 1 ? "Activo" : "Inactivo"}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2"
              onclick="editarDistrito(${d[0]}, '${d[1]}', ${d[4]}, ${d[3]})">
              Editar
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="eliminarDistrito(${d[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Error cargando distritos:", err);
  }
}

// ============================================
// FILTRAR DISTRITOS POR CANTÓN
// ============================================

async function filtrarDistritos() {
  const idCanton = document.getElementById("filtro-canton").value;

  if (idCanton == 0 || idCanton === "" || idCanton === null) {
    cargarDistritos();
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/distritos/canton/${idCanton}`);
    const data = await res.json();

    console.log("DISTRITOS filtrados:", data);

    const tbody = document.getElementById("tabla-distritos");
    tbody.innerHTML = "";

    if (!data.distritos) return;

    data.distritos.forEach(d => {
      tbody.innerHTML += `
        <tr>
          <td>${d[0]}</td>
          <td>${d[1]}</td>
          <td>${d[2]}</td>
          <td>${d[3] == 1 ? "Activo" : "Inactivo"}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2"
              onclick="editarDistrito(${d[0]}, '${d[1]}', ${d[4]}, ${d[3]})">
              Editar
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="eliminarDistrito(${d[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error filtrando distritos:", err);
  }
}

// ============================================
// RESTABLECER LISTA COMPLETA
// ============================================

function verTodosDistritos() {
  cargarDistritos();
}

// =====================================================
//  LLENAR SELECTS DEL MODAL
// =====================================================

async function cargarCantonesModal() {
  const res = await fetch("http://localhost:5000/api/cantones");
  const data = await res.json();

  const select = document.getElementById("distrito-canton");
  select.innerHTML = "";

  if (!data.cantones) return;

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });
}

async function cargarEstadosDistritoModal() {
  const res = await fetch("http://localhost:5000/api/estados");
  const data = await res.json();

  const select = document.getElementById("distrito-estado");
  select.innerHTML = "";

  if (!data.estados) return;

  data.estados.forEach(e => {
    select.innerHTML += `<option value="${e[0]}">${e[1]}</option>`;
  });
}

// =====================================================
//  FILTRO DE CANTONES (arriba de la tabla)
// =====================================================

async function cargarFiltroCantones() {
  const res = await fetch("http://localhost:5000/api/cantones");
  const data = await res.json();

  const select = document.getElementById("filtro-canton");
  select.innerHTML = `<option value="0">Todos los cantones</option>`;

  if (!data.cantones) return;

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });
}

// =====================================================
// INIT — CUANDO SE CARGA LA PÁGINA
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // solo si existe la vista de distritos en esta página
  if (document.getElementById("view-distritos")) {
    cargarFiltroCantones();
    cargarDistritos();

    const modalDistrito = document.getElementById("modal-distrito");
    if (modalDistrito) {
      modalDistrito.addEventListener("show.bs.modal", async () => {
        await cargarCantonesModal();
        await cargarEstadosDistritoModal();
      });
    }
  }
});

// =====================================================
//  EDITAR
// =====================================================

function editarDistrito(id, nombre, canton, estado) {
  document.getElementById("distrito-id").value = id;
  document.getElementById("distrito-nombre").value = nombre;
  document.getElementById("distrito-canton").value = canton;
  document.getElementById("distrito-estado").value = estado;

  const modal = new bootstrap.Modal(document.getElementById("modal-distrito"));
  modal.show();
}

// =====================================================
// INSERTAR / UPDATE
// =====================================================

document.getElementById("form-distrito").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("distrito-id").value;
  const nombre = document.getElementById("distrito-nombre").value;
  const canton = document.getElementById("distrito-canton").value;
  const estado = document.getElementById("distrito-estado").value;

  const dataSend = { nombre, canton, estado };
  let res;

  if (!id) {
    // INSERT
    res = await fetch("http://localhost:5000/api/distritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  } else {
    // UPDATE
    res = await fetch(`http://localhost:5000/api/distritos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  }

  const data = await res.json();
  if (!data.success) return alert("Error: " + data.error);

  bootstrap.Modal.getInstance(document.getElementById("modal-distrito")).hide();
  cargarDistritos();
});

// =====================================================
//  ELIMINAR (DELETE LÓGICO)
// =====================================================

async function eliminarDistrito(id) {
  if (!confirm("¿Seguro que desea inactivar este distrito?")) return;

  const res = await fetch(`http://localhost:5000/api/distritos/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (!data.success) return alert("Error eliminando distrito");

  cargarDistritos();
}
//---------cargar modal----------------------------------
const modalDistrito = document.getElementById("modal-distrito");

modalDistrito.addEventListener("show.bs.modal", async () => {
  console.log("Modal distrito abierto");

  await cargarCantonesModal();
  await cargarEstadosDistritoModal();
});



//-------------------------------------------------------------

//---------------------------------------------------------------

async function cargarSucursales() {
  try {
    const res = await fetch("http://localhost:5000/api/sucursales");
    const data = await res.json();

    const tbody = document.getElementById("tabla-sucursales");
    tbody.innerHTML = "";

    if (!data.sucursales) return;

    data.sucursales.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s[0]}</td>
          <td>${s[1]}</td>
          <td>${s[4]}, ${s[5]}, ${s[6]}</td>
          <td>${s[7]}</td>
          <td>${s[8]}</td>

          <td>
            <button class="btn btn-primary btn-sm me-2"
              onclick="editarSucursal(${s[0]}, '${s[1]}', '${s[2]}', '${s[3]}',
                                       ${s[9]}, ${s[10]}, ${s[11]}, ${s[12]},
                                       '${s[7]}', '${s[13]}', ${s[14]})">
              Editar
            </button>

            <button class="btn btn-danger btn-sm"
              onclick="eliminarSucursal(${s[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error cargando sucursales:", err);
  }
}

async function cargarEstadosSucursalModal() {
  const res = await fetch("http://localhost:5000/api/estados");
  const data = await res.json();

  const select = document.getElementById("sucursal-estado");
  select.innerHTML = "";

  data.estados.forEach(e => {
    select.innerHTML += `<option value="${e[0]}">${e[1]}</option>`;
  });
}

async function cargarProvinciasModalSucursal() {
  const res = await fetch("http://localhost:5000/api/provincias");
  const data = await res.json();

  const select = document.getElementById("sucursal-provincia");
  select.innerHTML = "";

  data.provincias.forEach(p => {
    select.innerHTML += `<option value="${p[0]}">${p[1]}</option>`;
  });
}

async function cargarCantonesModalSucursal(idProvincia) {
  const res = await fetch(`http://localhost:5000/api/cantones/provincia/${idProvincia}`);
  const data = await res.json();

  const select = document.getElementById("sucursal-canton");
  select.innerHTML = "";

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });
}

async function cargarDistritosModal(idCanton) {
  const res = await fetch(`http://localhost:5000/api/distritos/canton/${idCanton}`);
  const data = await res.json();

  const select = document.getElementById("sucursal-distrito");
  select.innerHTML = "";

  data.distritos.forEach(d => {
    select.innerHTML += `<option value="${d[0]}">${d[1]}</option>`;
  });
}

document.getElementById("sucursal-provincia").addEventListener("change", async (e) => {
  const idProvincia = e.target.value;
  await cargarCantonesModalSucursal(idProvincia);

  const idCantonNuevo = document.getElementById("sucursal-canton").value;
  await cargarDistritosModal(idCantonNuevo);
});

document.getElementById("sucursal-canton").addEventListener("change", async (e) => {
  const idCanton = e.target.value;
  await cargarDistritosModal(idCanton);
});

async function editarSucursal(
  idSucursal,
  nombreSucursal,
  telefono,
  fechaApertura,

  idDireccion,
  idProvincia,
  idCanton,
  idDistrito,

  detalleDireccion,
  codigoPostal,
  idEstado
) {
  // Guardar ID dirección globalmente
  window._idDireccionActual = idDireccion;

  // Datos sucursal
  document.getElementById("sucursal-id").value = idSucursal;
  document.getElementById("sucursal-nombre").value = nombreSucursal;
  document.getElementById("sucursal-telefono").value = telefono;
  document.getElementById("sucursal-fecha").value = fechaApertura;

  // Datos dirección
  document.getElementById("sucursal-detalle").value = detalleDireccion;
  document.getElementById("sucursal-codigo-postal").value = codigoPostal;

  // Estados
  await cargarEstadosSucursalModal();
  document.getElementById("sucursal-estado").value = idEstado;

  // UBICACIÓN CASCADA
  await cargarProvinciasModal();
  document.getElementById("sucursal-provincia").value = idProvincia;

  await cargarCantonesModalSucursal(idProvincia);
  document.getElementById("sucursal-canton").value = idCanton;

  await cargarDistritosModal(idCanton);
  document.getElementById("sucursal-distrito").value = idDistrito;

  const modal = new bootstrap.Modal(document.getElementById("modal-sucursal"));
  modal.show();
}

document.getElementById("form-sucursal").addEventListener("submit", async (e) => {
  e.preventDefault();

  const idSucursal = document.getElementById("sucursal-id").value;

  const dataSend = {
    nombreSucursal: document.getElementById("sucursal-nombre").value,
    telefono: document.getElementById("sucursal-telefono").value,
    fechaApertura: document.getElementById("sucursal-fecha").value,
    detalleDireccion: document.getElementById("sucursal-detalle").value,
    codigoPostal: document.getElementById("sucursal-codigo-postal").value,
    idDistrito: document.getElementById("sucursal-distrito").value,
    idEstado: document.getElementById("sucursal-estado").value
  };

  let res;

  if (!idSucursal) {
    // INSERT
    res = await fetch("http://localhost:5000/api/sucursales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  } else {
    // UPDATE
    dataSend.idDireccion = window._idDireccionActual;

    res = await fetch(`http://localhost:5000/api/sucursales/${idSucursal}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend)
    });
  }

  const data = await res.json();
  if (!data.success) return alert(data.error);

  bootstrap.Modal.getInstance(document.getElementById("modal-sucursal")).hide();
  cargarSucursales();
});

async function eliminarSucursal(id) {
  if (!confirm("¿Seguro que desea inactivar esta sucursal?")) return;

  const res = await fetch(`http://localhost:5000/api/sucursales/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();

  if (!data.success) return alert("Error eliminando sucursal");

  cargarSucursales();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("view-sucursales")) {

    cargarSucursales();

    const modalSucursal = document.getElementById("modal-sucursal");
    modalSucursal.addEventListener("show.bs.modal", async () => {

      await cargarEstadosSucursalModal();
      await cargarProvinciasModalSucursal();

      const idProvincia = document.getElementById("sucursal-provincia").value;
      await cargarCantonesModalSucursal(idProvincia);

      const idCanton = document.getElementById("sucursal-canton").value;
      await cargarDistritosModal(idCanton);
    });
  }
});

async function cargarFiltroProvincias() {
  const res = await fetch("http://localhost:5000/api/provincias");
  const data = await res.json();

  const select = document.getElementById("filtro-provincia");
  select.innerHTML = `<option value="0">Todas</option>`;

  data.provincias.forEach(p => {
    select.innerHTML += `<option value="${p[0]}">${p[1]}</option>`;
  });
}

async function cargarFiltroCantonesSucursales(idProvincia) {
  const select = document.getElementById("filtro-canton");

  if (idProvincia == 0) {
    select.innerHTML = `<option value="0">Todos</option>`;
    document.getElementById("filtro-distrito").innerHTML = `<option value="0">Todos</option>`;
    return;
  }

  const res = await fetch(`http://localhost:5000/api/cantones/provincia/${idProvincia}`);
  const data = await res.json();

  select.innerHTML = `<option value="0">Todos</option>`;

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });
}

async function cargarFiltroDistritos(idCanton) {
  const select = document.getElementById("filtro-distrito");

  if (idCanton == 0) {
    select.innerHTML = `<option value="0">Todos</option>`;
    return;
  }

  const res = await fetch(`http://localhost:5000/api/distritos/canton/${idCanton}`);
  const data = await res.json();

  select.innerHTML = `<option value="0">Todos</option>`;

  data.distritos.forEach(d => {
    select.innerHTML += `<option value="${d[0]}">${d[1]}</option>`;
  });
}

document.getElementById("filtro-provincia").addEventListener("change", async (e) => {
  const idProvincia = e.target.value;

  await cargarFiltroCantonesSucursales(idProvincia);
  await cargarFiltroDistritos(0);

  filtrarSucursales();
});

document.getElementById("filtro-canton").addEventListener("change", async (e) => {
  const idCanton = e.target.value;

  await cargarFiltroDistritos(idCanton);

  filtrarSucursales();
});

document.getElementById("filtro-distrito").addEventListener("change", () => {
  filtrarSucursales();
});

async function filtrarSucursales() {
  const idProvincia = document.getElementById("filtro-provincia").value;
  const idCanton = document.getElementById("filtro-canton").value;
  const idDistrito = document.getElementById("filtro-distrito").value;

  // Si todo está en "0" → mostrar todas
  if (idProvincia == 0 && idCanton == 0 && idDistrito == 0) {
    cargarSucursales();
    return;
  }

  const res = await fetch("http://localhost:5000/api/sucursales");
  const data = await res.json();

  const tbody = document.getElementById("tabla-sucursales");
  tbody.innerHTML = "";

  data.sucursales
    .filter(s => (idProvincia == 0 || s[10] == idProvincia))   // ID_PROVINCIA
    .filter(s => (idCanton == 0 || s[11] == idCanton))         // ID_CANTON
    .filter(s => (idDistrito == 0 || s[12] == idDistrito))     // ID_DISTRITO
    .forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s[0]}</td>
          <td>${s[1]}</td>
          <td>${s[4]}, ${s[5]}, ${s[6]}</td>
          <td>${s[7]}</td>
          <td>${s[8]}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2"
              onclick="editarSucursal(${s[0]}, '${s[1]}', '${s[2]}', '${s[3]}',
                                       ${s[9]}, ${s[10]}, ${s[11]}, ${s[12]},
                                       '${s[7]}', '${s[13]}', ${s[14]})">
              Editar
            </button>

            <button class="btn btn-danger btn-sm"
              onclick="eliminarSucursal(${s[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });
}

function verTodasSucursales() {
  document.getElementById("filtro-provincia").value = 0;
  document.getElementById("filtro-canton").innerHTML = `<option value="0">Todos</option>`;
  document.getElementById("filtro-distrito").innerHTML = `<option value="0">Todos</option>`;
  cargarSucursales();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("view-sucursales")) {

    cargarSucursales();

    await cargarFiltroProvincias();
    await cargarFiltroCantonesSucursales(0);
    await cargarFiltroDistritos(0);

    const modalSucursal = document.getElementById("modal-sucursal");
    modalSucursal.addEventListener("show.bs.modal", async () => {

      await cargarEstadosSucursalModal();
      await cargarProvinciasModalSucursal();

      const idProvincia = document.getElementById("sucursal-provincia").value;
      await cargarCantonesModalSucursal(idProvincia);

      const idCanton = document.getElementById("sucursal-canton").value;
      await cargarDistritosModal(idCanton);
    });
  }
});

async function cargarCantonesModalSucursal(idProvincia) {
  const res = await fetch(`http://localhost:5000/api/cantones/provincia/${idProvincia}`);
  const data = await res.json();

  const select = document.getElementById("sucursal-canton");
  if (!select) return;

  select.innerHTML = "";

  if (!data.cantones) return;

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });
}

async function cargarDistritosModal(idCanton) {
  const res = await fetch(`http://localhost:5000/api/distritos/canton/${idCanton}`);
  const data = await res.json();

  const select = document.getElementById("sucursal-distrito");
  if (!select) return;

  select.innerHTML = "";

  if (!data.distritos) return;

  data.distritos.forEach(d => {
    select.innerHTML += `<option value="${d[0]}">${d[1]}</option>`;
  });
}

async function cargarFiltroProvincias() {
  const res = await fetch("http://localhost:5000/api/provincias");
  const data = await res.json();

  const select = document.getElementById("filtro-provincia");
  if (!select) return;

  select.innerHTML = `<option value="0">Todas</option>`;

  if (!data.provincias) return;

  data.provincias.forEach(p => {
    select.innerHTML += `<option value="${p[0]}">${p[1]}</option>`;
  });
}

async function cargarFiltroCantonesSucursales(idProvincia) {
  const select = document.getElementById("filtro-canton");
  if (!select) return;

  if (idProvincia == 0) {
    select.innerHTML = `<option value="0">Todos</option>`;
    const filtroDistrito = document.getElementById("filtro-distrito");
    if (filtroDistrito) filtroDistrito.innerHTML = `<option value="0">Todos</option>`;
    return;
  }

  const res = await fetch(`http://localhost:5000/api/cantones/provincia/${idProvincia}`);
  const data = await res.json();

  select.innerHTML = `<option value="0">Todos</option>`;

  if (!data.cantones) return;

  data.cantones.forEach(c => {
    select.innerHTML += `<option value="${c[0]}">${c[1]}</option>`;
  });
}

async function cargarFiltroDistritos(idCanton) {
  const select = document.getElementById("filtro-distrito");
  if (!select) return;

  if (idCanton == 0) {
    select.innerHTML = `<option value="0">Todos</option>`;
    return;
  }

  const res = await fetch(`http://localhost:5000/api/distritos/canton/${idCanton}`);
  const data = await res.json();

  select.innerHTML = `<option value="0">Todos</option>`;

  if (!data.distritos) return;

  data.distritos.forEach(d => {
    select.innerHTML += `<option value="${d[0]}">${d[1]}</option>`;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // ==========================
  // Estamos en la vista de sucursales
  // ==========================
  if (document.getElementById("view-sucursales")) {

    // Carga inicial de la tabla
    cargarSucursales();

    // -------- Filtros (arriba de la tabla) --------
    await cargarFiltroProvincias();
    await cargarFiltroCantonesSucursales(0);
    await cargarFiltroDistritos(0);

    const filtroProvincia = document.getElementById("filtro-provincia");
    const filtroCanton = document.getElementById("filtro-canton");
    const filtroDistrito = document.getElementById("filtro-distrito");

    if (filtroProvincia) {
      filtroProvincia.addEventListener("change", async (e) => {
        const idProv = e.target.value;
        await cargarFiltroCantonesSucursales(idProv);
        await cargarFiltroDistritos(0);
        filtrarSucursales();
      });
    }

    if (filtroCanton) {
      filtroCanton.addEventListener("change", async (e) => {
        const idCanton = e.target.value;
        await cargarFiltroDistritos(idCanton);
        filtrarSucursales();
      });
    }

    if (filtroDistrito) {
      filtroDistrito.addEventListener("change", () => {
        filtrarSucursales();
      });
    }

    // -------- Modal de sucursal --------
    const modalSucursal = document.getElementById("modal-sucursal");

    if (modalSucursal) {
      modalSucursal.addEventListener("show.bs.modal", async () => {
        // cuando se abre el modal, llenar selects
        await cargarEstadosSucursalModal();
        await cargarProvinciasModalSucursal();

        const provSelect = document.getElementById("sucursal-provincia");
        if (provSelect) {
          const idProv = provSelect.value || provSelect.options[0]?.value;
          if (idProv) {
            await cargarCantonesModalSucursal(idProv);
            const cantonSelect = document.getElementById("sucursal-canton");
            const idCanton = cantonSelect?.value || cantonSelect?.options[0]?.value;
            if (idCanton) {
              await cargarDistritosModal(idCanton);
            }
          }
        }
      });

      // Cascada dentro del modal
      const provModal = document.getElementById("sucursal-provincia");
      const cantonModal = document.getElementById("sucursal-canton");

      if (provModal) {
        provModal.addEventListener("change", async (e) => {
          const idProv = e.target.value;
          await cargarCantonesModalSucursal(idProv);
          const cantonSelect = document.getElementById("sucursal-canton");
          const idCanton = cantonSelect?.value || cantonSelect?.options[0]?.value;
          if (idCanton) {
            await cargarDistritosModal(idCanton);
          }
        });
      }

      if (cantonModal) {
        cantonModal.addEventListener("change", async (e) => {
          const idCanton = e.target.value;
          await cargarDistritosModal(idCanton);
        });
      }
    }
  }
});


//-------------------------------------

//-------------------------------------------
// =====================================================
//  USUARIOS – CRUD REST
// =====================================================

// ==========================
// LISTAR USUARIOS
// ==========================
async function cargarUsuarios() {
  try {
    const res = await fetch("http://localhost:5000/api/usuarios");
    const data = await res.json();

    console.log("DATA USUARIOS:", data);

    const tbody = document.getElementById("tabla-usuarios");
    tbody.innerHTML = "";

    if (!data.usuarios || data.usuarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            No hay usuarios para mostrar
          </td>
        </tr>
      `;
      return;
    }

    data.usuarios.forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u[0]}</td>
          <td>${u[1]}</td>
          <td>${u[2]}</td>
          <td>${u[3]}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2"
              onclick="editarUsuario(${u[0]}, '${u[2]}')">
              Editar
            </button>

            <button class="btn btn-sm btn-danger"
              onclick="eliminarUsuario(${u[0]})">
              Inactivar
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error cargando usuarios:", err);
  }
}
//------------------------------
// guardar cliente
//--------------------------------

document.getElementById("form-cliente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = {
    cedula: "000000000",
    nombre: document.getElementById("cliente-nombre").value,
    apellidoP: document.getElementById("cliente-apellido-p").value,
    apellidoM: document.getElementById("cliente-apellido-m").value,
    fechaNacimiento: new Date(),
    contrasena: "1234",

    idCorreo: null,
    idTelefono: null,
    idDireccion: null,

    idPuesto: null,
    idSucursal: null,
    idEstado: document.getElementById("cliente-estado").value,

    tipoUsuario: "CLIENTE",
    salario: 0,
    fechaContrato: null,
    puntos: 0,

    creadoPor: "APP"
  };

  const res = await fetch("http://localhost:5000/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  });

  const data = await res.json();
  if (!data.success) return alert(data.error);

  bootstrap.Modal.getInstance(
    document.getElementById("modal-cliente")
  ).hide();

  cargarUsuarios();
});

//------------------------------
// guardar empleado/gerente
//-------------------------------
document.getElementById("form-empleado").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = {
    cedula: document.getElementById("empleado-cedula")?.value || "000000000",
    nombre: document.getElementById("empleado-nombre").value,
    apellidoP: document.getElementById("empleado-apellido-p").value,
    apellidoM: document.getElementById("empleado-apellido-m").value,
    fechaNacimiento: new Date(),
    contrasena: "1234",

    idCorreo: null,
    idTelefono: null,
    idDireccion: null,

    idPuesto: document.getElementById("empleado-puesto").value,
    idSucursal: null,
    idEstado: document.getElementById("empleado-estado").value,

    tipoUsuario: "EMPLEADO",
    salario: 0,
    fechaContrato: new Date(),
    puntos: null,

    creadoPor: "APP"
  };

  const res = await fetch("http://localhost:5000/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  });

  const data = await res.json();
  if (!data.success) return alert(data.error);

  bootstrap.Modal.getInstance(
    document.getElementById("modal-empleado")
  ).hide();

  cargarUsuarios();
});


async function eliminarUsuario(id) {
  if (!confirm("¿Desea inactivar este usuario?")) return;

  const res = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (!data.success) return alert(data.error);

  cargarUsuarios();
}

async function editarUsuario(idUsuario, tipoUsuario) {
  try {
    const res = await fetch(`http://localhost:5000/api/usuarios/${idUsuario}`);
    const data = await res.json();

    if (!data.success) {
      alert("No se pudo cargar el usuario");
      return;
    }

    const u = data.usuario;
    console.log("USUARIO A EDITAR:", u);

    if (tipoUsuario !== "EMPLEADO") return;

    // ===============================
    // 1. CAMPOS DE TEXTO
    // ===============================
    document.getElementById("empleado-id").value = u[0];
    document.getElementById("empleado-nombre").value = u[2];
    document.getElementById("empleado-apellido-p").value = u[3];
    document.getElementById("empleado-apellido-m").value = u[4] || "";

    // ===============================
    // 2. CARGAR SELECTS (EN ORDEN)
    // ===============================
    await cargarPuestos();
    await cargarEstadosEmpleado();
    await cargarProvinciasEmpleado();

    // ===============================
    // 3. ASIGNAR VALORES
    // ===============================
    document.getElementById("empleado-puesto").value = u[8];
    document.getElementById("empleado-estado").value = u[7];

    document.getElementById("empleado-provincia").value = u[10];

    await cargarCantonesEmpleado(u[10]);
    document.getElementById("empleado-canton").value = u[11];

    await cargarDistritosEmpleado(u[11]);
    document.getElementById("empleado-distrito").value = u[12];

    document.getElementById("empleado-detalle-direccion").value = u[13] || "";
    document.getElementById("empleado-correo").value = u[14] || "";
    document.getElementById("empleado-telefono").value = u[15] || "";

    // ===============================
    // 4. ABRIR MODAL
    // ===============================
    new bootstrap.Modal(
      document.getElementById("modal-empleado")
    ).show();

  } catch (err) {
    console.error("Error precargando empleado:", err);
  }
}

function precargarCliente(u) {
  document.getElementById("cliente-id").value = u[0];
  document.getElementById("cliente-nombre").value = u[2];
  document.getElementById("cliente-apellido-p").value = u[3];
  document.getElementById("cliente-apellido-m").value = u[4] ?? "";
  document.getElementById("cliente-estado").value = u[11];

  // Dirección (si existe)
  if (u[7]) {
    document.getElementById("cliente-provincia").value = u[7];
    document.getElementById("cliente-canton").value = u[8];
    document.getElementById("cliente-distrito").value = u[9];
    document.getElementById("cliente-detalle-direccion").value = u[10] ?? "";
  }
}

function precargarEmpleado(u) {
  document.getElementById("empleado-id").value = u[0];
  document.getElementById("empleado-nombre").value = u[2];
  document.getElementById("empleado-apellido-p").value = u[3];
  document.getElementById("empleado-apellido-m").value = u[4] ?? "";

  document.getElementById("empleado-puesto").value = u[13];
  document.getElementById("empleado-estado").value = u[11];

  // Dirección
  if (u[7]) {
    document.getElementById("empleado-provincia").value = u[7];
    document.getElementById("empleado-canton").value = u[8];
    document.getElementById("empleado-distrito").value = u[9];
    document.getElementById("empleado-detalle-direccion").value = u[10] ?? "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("view-usuarios")) {
    cargarUsuarios();
  }
});


/*
function editarUsuario(id, tipo) {
  if (tipo === "CLIENTE") {
    new bootstrap.Modal(document.getElementById("modal-cliente")).show();
  } else {
    new bootstrap.Modal(document.getElementById("modal-empleado")).show();
  }
}
*/
async function eliminarUsuario(id) {
  if (!confirm("¿Seguro que desea inactivar este usuario?")) return;

  await fetch(`http://localhost:5000/api/usuarios/${id}`, {
    method: "DELETE"
  });

  cargarUsuarios();
}