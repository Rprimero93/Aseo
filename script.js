// ============================
// CONFIG
// ============================

const POWER_AUTOMATE_URL = "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/903ebf87d1c0465fafca73e8dd0e9c8a/triggers/manual/paths/invoke?api-version=1";

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initFormHandlers();
    initValidations();
    enhanceUX();
});

// ============================
// TABS
// ============================
function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // botones
            document.querySelectorAll(".tab-button").forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            // paneles
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add("active");
        });
    });
}

// ============================
// FORM HANDLERS
// ============================
function initFormHandlers() {
    const form = document.getElementById("ordenCompraForm");
    const btnRegistrar = document.getElementById("btnRegistrar");
    const btnLimpiar = document.getElementById("btnLimpiar");

    btnRegistrar.addEventListener("click", async () => {
        await handleEnviar(form, btnRegistrar);
    });

    btnLimpiar.addEventListener("click", () => {
        form.reset();
        const estado = document.getElementById("estadoEnvio");
        estado.innerText = "";
        estado.className = "estado-envio";
    });
}

// ============================
// VALIDACIONES (fechas, nit, url)
// ============================
function initValidations() {
    // NIT solo números
    document.getElementById("nit").addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
    });

    // Fecha inicio vs terminacion
    const fechaInicio = document.getElementById("fechaInicio");
    const fechaTerm = document.getElementById("fechaTerminacion");

    fechaInicio.addEventListener("change", function () {
        if (fechaTerm.value && new Date(this.value) > new Date(fechaTerm.value)) {
            alert("La fecha de inicio no puede ser posterior a la fecha de terminación");
            this.value = "";
        }
    });

    fechaTerm.addEventListener("change", function () {
        if (fechaInicio.value && new Date(this.value) < new Date(fechaInicio.value)) {
            alert("La fecha de terminación no puede ser anterior a la fecha de inicio");
            this.value = "";
        }
    });

    // URL: si no comienza con http(s) lo prefija
    const linkInput = document.getElementById("linkColombiaCompra");
    linkInput.addEventListener("blur", function () {
        if (this.value && !/^(http|https):\/\//i.test(this.value)) {
            this.value = "https://" + this.value;
        }
    });
}

// ============================
// UX: focus en campos
// ============================
function enhanceUX() {
    document.querySelectorAll(".form-group input, .form-group textarea, .form-group select").forEach(el => {
        el.addEventListener("focus", function () {
            this.parentElement.classList.add("focused");
        });
        el.addEventListener("blur", function () {
            this.parentElement.classList.remove("focused");
        });
    });
}

// ============================
// FUNCIONES DE ENVIO
// ============================
function validarFormulario(form) {
    let valido = true;
    const requireds = form.querySelectorAll("[required]");
    requireds.forEach(field => {
        if (!field.value || !String(field.value).trim()) {
            valido = false;
        }
    });
    return valido;
}

async function handleEnviar(form, boton) {
    const estado = document.getElementById("estadoEnvio");

    // Validación básica
    if (!validarFormulario(form)) {
        estado.innerText = "❌ Por favor complete todos los campos obligatorios.";
        estado.className = "estado-envio error";
        return;
    }

    // Preparar JSON
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
        payload[key] = value;
    });

    // Mostrar cargando y deshabilitar botón
    boton.disabled = true;
    const originalText = boton.innerText;
    boton.innerText = "Enviando...";
    estado.innerText = "⏳ Enviando información...";
    estado.className = "estado-envio cargando";

    try {
        const resp = await fetch(POWER_AUTOMATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            throw new Error(`HTTP ${resp.status} ${text}`);
        }

        estado.innerText = "✔ Registro enviado correctamente.";
        estado.className = "estado-envio exito";
        form.reset();

    } catch (err) {
        console.error("Error enviando datos:", err);
        estado.innerText = "❌ Error al enviar la información. Ver consola para más detalles.";
        estado.className = "estado-envio error";
    } finally {
        boton.disabled = false;
        boton.innerText = originalText;
    }
}
