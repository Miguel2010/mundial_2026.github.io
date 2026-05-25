// ===============================
// CARGAR CLASIFICACIÓN AL INICIAR
// ===============================
window.addEventListener("DOMContentLoaded", () => {

  // Cargar tabla si existe
  const saved = localStorage.getItem("clasificacion");
  if (saved) {
    const data = JSON.parse(saved);
    renderTable(data);
  }

  mostrarUltimaActualizacion();

  // Recuperar sesión
  const usuario = localStorage.getItem("usuarioLogado");

  if (usuario) {
    loginScreen.style.display = "none";
    mainContent.style.display = "block";
    logoutBtn.style.display = "block";

    // Si el usuario logado es Juan Navarro → mostrar zona de carga y botón reset
    if (usuario.toLowerCase() === "juan navarro") {
      adminTools.style.display = "block";
      resetTablaBtn.style.display = "block";
    }
  }
});

// ===============================
// LOGIN
// ===============================
const btnLogin = document.getElementById("btnLogin");
const loginScreen = document.getElementById("loginScreen");
const mainContent = document.getElementById("mainContent");
const adminTools = document.getElementById("adminTools");
const logoutBtn = document.getElementById("logoutBtn");
const resetTablaBtn = document.getElementById("resetTablaBtn");

btnLogin.addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value.trim().toLowerCase();
  const apellido = document.getElementById("apellido").value.trim().toLowerCase();
  const loginError = document.getElementById("loginError");

  if (!nombre || !apellido) {
    loginError.textContent = "Debes introducir nombre y primer apellido";
    return;
  }

  loginError.textContent = "";

  // Mostrar contenido principal
  loginScreen.style.display = "none";
  mainContent.style.display = "block";

  // Guardar sesión
  const usuarioCompleto = nombre + " " + apellido;
  localStorage.setItem("usuarioLogado", usuarioCompleto);

  // Mostrar botón logout
  logoutBtn.style.display = "block";

  // Si es Juan Navarro, activar zona de carga y botón reset
  if (usuarioCompleto === "juan navarro") {
    adminTools.style.display = "block";
    resetTablaBtn.style.display = "block";
  }
});

// ===============================
// CERRAR SESIÓN
// ===============================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");

  logoutBtn.style.display = "none";
  adminTools.style.display = "none";
  resetTablaBtn.style.display = "none";

  loginScreen.style.display = "block";
  mainContent.style.display = "none";
});

// ===============================
// BOTÓN REINICIAR TABLA (solo Juan)
// ===============================
resetTablaBtn.addEventListener("click", () => {
  const confirmar = confirm("¿Seguro que quieres reiniciar la tabla? Esta acción no se puede deshacer.");

  if (!confirmar) return;

  // Borrar datos guardados
  localStorage.removeItem("clasificacion");
  localStorage.removeItem("ultimaActualizacion");

  // Vaciar tabla
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";

  // Borrar fecha en pantalla
  document.getElementById("ultimaActualizacion").textContent = "";

  alert("La tabla ha sido reiniciada.");
});

// ===============================
// LECTURA DEL CSV
// ===============================
const csvFile = document.getElementById("csvFile");
csvFile.addEventListener("change", (e) => {
  readCSV(e.target.files[0]);
});

// DRAG & DROP
const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".csv")) {
    readCSV(file);
  }
});

// ===============================
// LEER CSV
// ===============================
function readCSV(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const data = parseCSV(text);

    // Guardar clasificación para todos
    localStorage.setItem("clasificacion", JSON.stringify(data));

    // Guardar fecha y hora
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-ES");
    const hora = ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    localStorage.setItem("ultimaActualizacion", `${fecha} ${hora}`);

    renderTable(data);
    mostrarUltimaActualizacion();

    // Permitir volver a seleccionar el mismo archivo
    csvFile.value = "";
  };

  reader.readAsText(file);
}

// ===============================
// PARSEAR CSV ROBUSTO
// ===============================
function parseCSV(csv) {

  // Eliminar BOM
  csv = csv.replace(/^\uFEFF/, "");

  // Saltos de línea Windows o Unix
  const lines = csv.trim().split(/\r?\n/);

  // Separar por coma o punto y coma
  const headers = lines[0].split(/[,;]+/).map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const values = line.split(/[,;]+/).map(v => v.trim());
    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = isNaN(values[i]) ? values[i] : Number(values[i]);
    });

    // Calcular total
    obj.total =
      obj.grupos +
      obj.dieciseisavos +
      obj.octavos +
      obj.cuartos +
      obj.semifinales +
      obj.final +
      obj.tercer_cuarto;

    return obj;
  });

  // Ordenar por total descendente
  rows.sort((a, b) => b.total - a.total);

  return rows;
}

// ===============================
// MOSTRAR TABLA
// ===============================
function renderTable(data) {
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Podio
    if (index === 0) tr.classList.add("oro");
    else if (index === 1) tr.classList.add("plata");
    else if (index === 2) tr.classList.add("bronce");
    else if (index < 10) tr.classList.add("top10");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.nombre}</td>
      <td>${row.grupos}</td>
      <td>${row.dieciseisavos}</td>
      <td>${row.octavos}</td>
      <td>${row.cuartos}</td>
      <td>${row.semifinales}</td>
      <td>${row.final}</td>
      <td>${row.tercer_cuarto}</td>
      <td><strong>${row.total}</strong></td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// MOSTRAR FECHA DE ACTUALIZACIÓN
// ===============================
function mostrarUltimaActualizacion() {
  const texto = localStorage.getItem("ultimaActualizacion");

  function intentarPintar() {
    const elemento = document.getElementById("ultimaActualizacion");

    if (!elemento) {
      setTimeout(intentarPintar, 50);
      return;
    }

    if (texto) {
      elemento.textContent = `Última actualización: ${texto}`;
    } else {
      elemento.textContent = "";
    }
  }

  intentarPintar();
}
