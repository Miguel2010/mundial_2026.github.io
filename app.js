// --- LOGIN ---
document.getElementById("btnLogin").addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value.trim().toLowerCase();
  const apellido = document.getElementById("apellido").value.trim().toLowerCase();

  const loginError = document.getElementById("loginError");

  if (!nombre || !apellido) {
    loginError.textContent = "Debes introducir nombre y primer apellido";
    return;
  }

  const esAdmin = (nombre === "juan" && apellido === "navarro");

  // Ocultar login y mostrar contenido
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainContent").style.display = "block";

  // Si es admin, mostrar herramientas
  if (esAdmin) {
    document.getElementById("adminTools").style.display = "block";
  }
});

// --- Selección de archivo ---
document.getElementById("csvFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) readCSV(file);
});

// --- Drag & Drop ---
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
  } else {
    alert("Por favor, arrastra un archivo CSV válido.");
  }
});

// --- Leer CSV ---
function readCSV(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const data = parseCSV(text);
    renderTable(data);
  };

  reader.readAsText(file);
}

// --- Convertir CSV a objetos ---
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
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

// --- Renderizar tabla ---
function renderTable(data) {
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";

  data.forEach((j, index) => {
    let clase = "";

    if (index === 0) clase = "oro";
    else if (index === 1) clase = "plata";
    else if (index === 2) clase = "bronce";
    else if (index < 10) clase = "top10";

    const fila = `
      <tr class="${clase}">
        <td>${index + 1}</td>
        <td>${j.nombre}</td>
        <td>${j.grupos}</td>
        <td>${j.dieciseisavos}</td>
        <td>${j.octavos}</td>
        <td>${j.cuartos}</td>
        <td>${j.semifinales}</td>
        <td>${j.final}</td>
        <td>${j.tercer_cuarto}</td>
        <td><strong>${j.total}</strong></td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

