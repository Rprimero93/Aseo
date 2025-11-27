// ============================
// URL DE POWER AUTOMATE
// ============================

const POWER_AUTOMATE_URL =
    "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/903ebf87d1c0465fafca73e8dd0e9c8a/triggers/manual/paths/invoke?api-version=1";


// Elementos
const form = document.getElementById("ordenCompraForm");
const estado = document.getElementById("estadoEnvio");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnLimpiar = document.getElementById("btnLimpiar");


// ============================
// VALIDAR FORMULARIO
// ============================

function validarFormulario() {
    let valido = true;
    estado.className = "estado-envio";

    form.querySelectorAll("[required]").forEach(input => {
        if (!input.value.trim()) {
            valido = false;
        }
    });

    if (!valido) {
        estado.innerHTML = "❌ Por favor complete todos los campos obligatorios.";
        estado.classList.add("error");
    }

    return valido;
}


// ============================
// ENVIAR A POWER AUTOMATE
// ============================

async function enviarDatos() {

    if (!validarFormulario()) return;

    estado.innerHTML = "⏳ Enviando información…";
    estado.className = "estado-envio cargando";

    const formData = new FormData(form);
    let data = {};
    formData.forEach((v, k) => data[k] = v);

    try {
        const res = await fetch(POWER_AUTOMATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Error HTTP");

        estado.innerHTML = "✔ Datos enviados correctamente.";
        estado.className = "estado-envio exito";

        form.reset();

    } catch (e) {
        estado.innerHTML = "❌ Error al enviar los datos. Verifique la URL o conexión.";
        estado.className = "estado-envio error";
        console.error(e);
    }
}


// ============================
// LIMPIAR FORMULARIO
// ============================

btnLimpiar.addEventListener("click", () => {
    form.reset();
    estado.innerHTML = "";
    estado.className = "estado-envio";
});

btnRegistrar.addEventListener("click", enviarDatos);


// ============================
// SISTEMA DE PESTAÑAS
// ============================

document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelector(".tab-button.active").classList.remove("active");
        btn.classList.add("active");

        document.querySelector(".tab-pane.active").classList.remove("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});
      