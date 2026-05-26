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

  // Comprobar cambios cada 60 segundos
  setInterval(comprobarActualizacionCSV, 60000);

});

// ===============================
// LOGIN
// ===============================
const btnLogin = document.getElementById("btnLogin");
const loginScreen = document.getElementById("loginScreen");
const mainContent = document.getElementById("mainContent");
const adminTools = document.getElementById("adminTools");
const logoutBtn = document.getElementById("logoutBtn");
let datosCSV = [];      // Todos los registros
let filasMostradas = 0;
const FILAS_POR_CARGA = 20; // filas visibles a la vez
let ultimaFechaModificacion = null;



/*Botón de login*/
btnLogin.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value.trim().toLowerCase();
  const apellidos = document.getElementById("apellidos").value.trim().toLowerCase();
  const loginError = document.getElementById("loginError");

  if (!nombre || !apellidos) {
    loginError.textContent = "Debes introducir nombre y apellidos";
    return;
  }

  // Comprobar CSV antes de entrar
  const valido = await csvEsValido();

  if (!valido) {
    document.getElementById("popupInfo").style.display = "flex";
    return; // Bloquea acceso
  }

  // Acceso normal
  loginError.textContent = "";
  loginScreen.style.display = "none";
  mainContent.style.display = "block";

  const usuarioCompleto = nombre + " " + apellidos;
  localStorage.setItem("usuarioLogado", usuarioCompleto);

  logoutBtn.style.display = "block";
});

/*Botón del popup*/
document.getElementById("popupCerrar").addEventListener("click", () => {
  document.getElementById("popupInfo").style.display = "none";
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
// LEER CSV DESDE GITHUB (TODOS)
// ===============================
async function cargarCSVDesdeGitHub() {
  const url = "https://raw.githubusercontent.com/Miguel2010/mundial_2026.github.io/main/data/clasificacion.csv";

  try {
    // Romper caché del navegador y GitHub
    const res = await fetch(url + "?v=" + Date.now(), {
      cache: "no-store"
    });

    // Si el fichero NO existe
    if (!res.ok) {
      console.warn("No se encontró el CSV en el repositorio");
      return;
    }

    const texto = await res.text();
    datosCSV = parseCSV(texto);

    // Cargar primeras filas
    filasMostradas = 0;
    document.querySelector("#tabla tbody").innerHTML = "";
    renderMasFilas();

  } catch (e) {
    console.error("Error cargando el fichero de clasificación:", e);
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
function renderMasFilas() {
  const tbody = document.querySelector("#tabla tbody");

  const limite = Math.min(filasMostradas + FILAS_POR_CARGA, datosCSV.length);

  for (let i = filasMostradas; i < limite; i++) {
    const row = datosCSV[i];
    const tr = document.createElement("tr");

    if (i === 0) tr.classList.add("oro");
    else if (i === 1) tr.classList.add("plata");
    else if (i === 2) tr.classList.add("bronce");
    else if (i < 10) tr.classList.add("top10");

    tr.innerHTML = `
      <td>${i + 1}</td>
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
  }

  filasMostradas = limite;
}

// ===============================
// MOSTRAR FECHA DE ACTUALIZACIÓN
// ===============================
async function mostrarUltimaActualizacion() {
  const usuario = "Miguel2010";
  const repo = "mundial_2026.github.io";
  const ruta = "data/clasificacion.csv";

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
    elemento.textContent = `Última actualización de la clasificación: ${fechaFormateada} ${horaFormateada}`;

  } catch (e) {
    console.error("Error obteniendo fecha del CSV:", e);
  }
}

// ==================================
// SCROLL BAJADA
// ==================================
const contenedor = document.querySelector(".tabla-scroll");

contenedor.addEventListener("scroll", () => {
  const scrollTop = contenedor.scrollTop;
  const altura = contenedor.clientHeight;
  const scrollTotal = contenedor.scrollHeight;

  if (scrollTop + altura >= scrollTotal - 50) {
    if (filasMostradas < datosCSV.length) {
      renderMasFilas();
    }
  }
});

// ====================================
// COMPROBAR SI SE HA MODIFICADO EL CSV
// ====================================
async function comprobarActualizacionCSV() {
  const url = "https://raw.githubusercontent.com/Miguel2010/mundial_2026.github.io/main/data/clasificacion.csv";

  try {
    const res = await fetch(url + "?check=" + Date.now(), {
      method: "GET",
      cache: "no-store"
    });

    const nuevaFecha = res.headers.get("Last-Modified");

    // Primera vez → guardar fecha
    if (!ultimaFechaModificacion) {
      ultimaFechaModificacion = nuevaFecha;
      return;
    }

    // Si la fecha cambia → refrescar tabla
    if (nuevaFecha !== ultimaFechaModificacion) {
      ultimaFechaModificacion = nuevaFecha;
      cargarCSVDesdeGitHub(); // recarga la tabla
      mostrarUltimaActualizacion(); //muestra la fecha de actualización
    }

  } catch (e) {
    console.error("Error comprobando actualización del CSV:", e);
  }
}





