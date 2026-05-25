// ===============================
// CARGAR CLASIFICACIÓN AL INICIAR
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("clasificacion");
  if (saved) {
    const data = JSON.parse(saved);
    renderTable(data);
  }

  mostrarUltimaActualizacion();
});

// ===============================
// LOGIN
// ===============================
const btnLogin = document.getElementById("btnLogin");
const loginScreen = document.getElementById("loginScreen");
const mainContent = document.getElementById("mainContent");
const adminTools = document.getElementById("adminTools");

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

  // Si es Juan Navarro, activar zona de carga
  if (nombre === "juan" && apellido === "navarro") {
    adminTools.style.display = "block";
  }
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

    // SOLUCIÓN: permitir volver a seleccionar el mismo archivo
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
  const elemento = document.getElementById("ultimaActualizacion");

  if (texto) {
    elemento.textContent = `Última actualización: ${texto}`;
  } else {
    elemento.textContent = "";
  }
}


