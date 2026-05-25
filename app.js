// ===============================
// CARGAR CLASIFICACIÓN AL INICIAR
// ===============================
window.addEventListener("DOMContentLoaded", () => {

  // Cargar tabla desde GitHub
  cargarCSVDesdeGitHub();

  mostrarUltimaActualizacion();

  // Recuperar sesión
  const usuario = localStorage.getItem("usuarioLogado");

  if (usuario) {
    loginScreen.style.display = "none";
    mainContent.style.display = "block";
    logoutBtn.style.display = "block";
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

btnLogin.addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value.trim().toLowerCase();
  const apellido = document.getElementById("apellido").value.trim().toLowerCase();
  const loginError = document.getElementById("loginError");

  if (!nombre || !apellido) {
    loginError.textContent = "Debes introducir nombre y primer apellido";
    return;
  }

  loginError.textContent = "";

  loginScreen.style.display = "none";
  mainContent.style.display = "block";

  const usuarioCompleto = nombre + " " + apellido;
  localStorage.setItem("usuarioLogado", usuarioCompleto);

  logoutBtn.style.display = "block";
});

// ===============================
// CERRAR SESIÓN
// ===============================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");

  logoutBtn.style.display = "none";
  adminTools.style.display = "none";

  loginScreen.style.display = "block";
  mainContent.style.display = "none";
});

// ===============================
// LECTURA DEL CSV LOCAL (ADMIN)
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
// LEER CSV LOCAL (ADMIN)
// ===============================
function readCSV(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const data = parseCSV(text);

    renderTable(data);
    mostrarUltimaActualizacion();

    csvFile.value = "";
  };

  reader.readAsText(file);
}

// ===============================
// LEER CSV DESDE GITHUB (TODOS)
// ===============================
async function cargarCSVDesdeGitHub() {
  const url = "https://raw.githubusercontent.com/Miguel2010/mundial_2026.github.io/blob/main/clasificacion.csv";

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("No se encontró el CSV en GitHub");
      return;
    }

    const texto = await res.text();
    const data = parseCSV(texto);
    renderTable(data);

  } catch (e) {
    console.error("Error cargando CSV desde GitHub:", e);
  }
}

// ===============================
// PARSEAR CSV ROBUSTO
// ===============================
function parseCSV(csv) {

  csv = csv.replace(/^\uFEFF/, "");

  const lines = csv.trim().split(/\r?\n/);

  const headers = lines[0].split(/[,;]+/).map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const values = line.split(/[,;]+/).map(v => v.trim());
    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = isNaN(values[i]) ? values[i] : Number(values[i]);
    });

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
async function mostrarUltimaActualizacion() {
  const usuario = "Miguel2010";
  const repo = "mundial_2026.github.io";
  const ruta = "blob/main/clasificacion.csv";

  const url = `https://api.github.com/repos/${usuario}/${repo}/commits?path=${ruta}&per_page=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("No se pudo obtener la fecha de actualización del CSV");
      return;
    }

    const commits = await res.json();
    if (commits.length === 0) return;

    const fechaISO = commits[0].commit.author.date;
    const fecha = new Date(fechaISO);

    const fechaFormateada = fecha.toLocaleDateString("es-ES");
    const horaFormateada = fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const elemento = document.getElementById("ultimaActualizacion");
    elemento.textContent = `Última actualización del CSV: ${fechaFormateada} ${horaFormateada}`;

  } catch (e) {
    console.error("Error obteniendo fecha del CSV:", e);
  }
}

