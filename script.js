// ============================
// CONFIG - URLs DE POWER AUTOMATE
// ============================



// ============================
// VARIABLES GLOBALES
// ============================
let registroEnEdicion = null;
let registrosCacheTab2 = [];

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initFormHandlers();
    initValidations();
    enhanceUX();
    initTab2();
    console.log("✅ Aplicación inicializada correctamente");
});

// ============================
// TABS
// ============================
function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-button").forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            const target = document.getElementById(btn.dataset.tab);
            if (target) {
                target.classList.add("active");
                // Cargar registros cuando se abre Tab 2
                if (btn.dataset.tab === "tab2") {
                    console.log("📂 Abriendo Tab 2 - Edición y Eliminación");
                }
            }
        });
    });
}

// ============================
// FORM HANDLERS - TAB 1
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
        registroEnEdicion = null;
        document.getElementById("btnRegistrar").innerText = "Registrar";
    });
}

// ============================
// VALIDACIONES
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
// VALIDACIÓN MEJORADA DEL FORMULARIO
// ============================
function validarFormulario(form) {
    let valido = true;
    const requireds = form.querySelectorAll("[required]");
    
    requireds.forEach(field => {
        if (!field.value || !String(field.value).trim()) {
            valido = false;
            resaltarCampoInvalido(field);
        }
        else if (field.tagName === 'SELECT' && field.value === '') {
            valido = false;
            resaltarCampoInvalido(field);
        }
        else {
            quitarResaltadoCampo(field);
        }
    });
    
    return valido;
}

function resaltarCampoInvalido(campo) {
    campo.style.borderColor = '#dc3545';
    campo.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.1)';
    
    let tooltip = campo.parentNode.querySelector('.error-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'error-tooltip';
        tooltip.style.color = '#dc3545';
        tooltip.style.fontSize = '12px';
        tooltip.style.marginTop = '4px';
        tooltip.innerText = 'Este campo es obligatorio';
        campo.parentNode.appendChild(tooltip);
    }
}

function quitarResaltadoCampo(campo) {
    campo.style.borderColor = '';
    campo.style.boxShadow = '';
    
    const tooltip = campo.parentNode.querySelector('.error-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// ============================
// ENVIO DE DATOS - TAB 1
// ============================
async function handleEnviar(form, boton) {
    const estado = document.getElementById("estadoEnvio");

    form.querySelectorAll('[required]').forEach(quitarResaltadoCampo);

    if (!validarFormulario(form)) {
        estado.innerText = "❌ Por favor complete todos los campos obligatorios correctamente.";
        estado.className = "estado-envio error";
        
        const primerInvalido = form.querySelector('[required]:invalid, [required][style*="border-color: #dc3545"]');
        if (primerInvalido) {
            primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerInvalido.focus();
        }
        return;
    }

    const payload = {
        "ordenCompra": document.getElementById("ordenCompra").value,
        "zona": document.getElementById("zona").value,
        "nit": document.getElementById("nit").value,
        "territorial": document.getElementById("territorial").value,
        "fechaInicio": document.getElementById("fechaInicio").value,
        "fechaTerminacion": document.getElementById("fechaTerminacion").value,
        "objeto": document.getElementById("objeto").value,
        "proveedor": document.getElementById("proveedor").value,
        "supervisor": document.getElementById("supervisor").value,
        "apoyoSupervision": document.getElementById("apoyoSupervision").value,
        "linkColombiaCompra": document.getElementById("linkColombiaCompra").value,
        "periodoSelect": document.getElementById("periodoSelect").value
    };

    console.log("📤 TAB 1 - Enviando payload:", payload);

    boton.disabled = true;
    const originalText = boton.innerText;
    boton.innerText = "Enviando...";
    estado.innerText = "⏳ Enviando información...";
    estado.className = "estado-envio cargando";

    try {
        const resp = await fetch(POWER_AUTOMATE_URLS.CREAR, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(`HTTP ${resp.status}: ${errorText}`);
        }

        let result;
        try {
            const responseText = await resp.text();
            result = responseText ? JSON.parse(responseText) : { success: true, message: "Empty response" };
        } catch (parseError) {
            result = { success: true, message: "Non-JSON response received" };
        }

        console.log("✅ Respuesta del servidor:", result);
        
        estado.innerText = "✔ Registro enviado correctamente.";
        estado.className = "estado-envio exito";
        form.reset();

    } catch (err) {
        console.error("❌ Error enviando datos:", err);
        estado.innerText = "❌ Error al enviar. Ver consola para detalles.";
        estado.className = "estado-envio error";
    } finally {
        boton.disabled = false;
        boton.innerText = originalText;
    }
}

// ===============================================
//      VARIABLES GLOBALES
// ===============================================
let registrosPeriodo = []; // Guarda los registros obtenidos del flujo

// URLs del flujo (colócalas como tú las tienes)
const POWER_AUTOMATE_URLS = {
    CREAR: "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/903ebf87d1c0465fafca73e8dd0e9c8a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ySYS6pVeRxRvD_AV6XQlRehosw7yEiCuFo_lp-HWi5A",
    OBTENER: "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e2224ca35609450db004b0a4ec687431/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WSc99eZxjj9T0GpcxE8abOcC3h3XSZnuPwhmI3-c9Io",
    EDITAR: "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bdb5b27bfaf646ea93dd1d565b4dc76c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pdjTok9R3g_tYmRhcicXDVoy-CgJ7UcpGfCpMdzBRkY",
    ELIMINAR: "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/69fafb50d7b44d65a043212f44332c40/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=39mPi4BFMP3MctUnyLqamrVZU0i9ulkB7-5SI48UyCo"
};


// ===============================================
//      1. CARGAR REGISTROS POR PERÍODO
// ===============================================
async function obtenerRegistrosPorPeriodo(periodo) {
    const estado = document.getElementById("estadoTab2");

    try {
        console.log("🔄 Llamando flujo OBTENER con período:", periodo);

        const resp = await fetch(POWER_AUTOMATE_URLS.OBTENER, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "periodo": periodo,
                "accion": "OBTENER_POR_PERIODO"
            })
        });

        if (!resp.ok) {
            throw new Error("HTTP " + resp.status);
        }

        const result = await resp.json();
        console.log("📦 Respuesta de Power Automate:", result);

        const registros = result.value || result.data || result || [];

        return Array.isArray(registros) ? registros : [];

    } catch (error) {
        console.error("❌ Error obtenerRegistrosPorPeriodo:", error);
        estado.innerText = "❌ Error al cargar información.";
        estado.className = "estado-envio error";
        return [];
    }
}


// ===============================================
//      2. CUANDO CAMBIA EL PERÍODO
// ===============================================
document.getElementById("periodoSelectTab2").addEventListener("change", async function () {
    const periodo = this.value;
    const selectOC = document.getElementById("ordenCompraSelectTab2");

    // Limpiar lista anterior
    selectOC.innerHTML = `<option value="">Cargando órdenes...</option>`;
    selectOC.disabled = true;

    if (!periodo) {
        selectOC.innerHTML = `<option value="">Seleccione un período primero</option>`;
        return;
    }

    // Obtener registros del flujo
    registrosPeriodo = await obtenerRegistrosPorPeriodo(periodo);

    if (registrosPeriodo.length === 0) {
        selectOC.innerHTML = `<option value="">No hay órdenes para este período</option>`;
        return;
    }

    // Llenar la lista de órdenes
    selectOC.innerHTML = `<option value="">Seleccione la orden de compra</option>`;

    registrosPeriodo.forEach(reg => {
        const oc = reg["ORDEN DE COMPRA"];
        if (oc) {
            const option = document.createElement("option");
            option.value = oc;
            option.textContent = oc;
            selectOC.appendChild(option);
        }
    });

    selectOC.disabled = false;
});


// ===============================================
//      3. CUANDO CAMBIA LA ORDEN DE COMPRA
// ===============================================
document.getElementById("ordenCompraSelectTab2").addEventListener("change", function () {
    const ocSeleccionada = this.value;

    if (!ocSeleccionada) return;

    // Buscar el registro completo
    const registro = registrosPeriodo.find(
        r => r["ORDEN DE COMPRA"] === ocSeleccionada
    );

    if (!registro) {
        console.error("⚠ No se encontró información para esta OC");
        return;
    }

    // Llenar formulario con los datos encontrados
    llenarFormularioEdicionTab2(registro);
});


// ===============================================
//      4. FUNCIÓN QUE AUTOCOMPLETA EL FORMULARIO
// ===============================================
function llenarFormularioEdicionTab2(registro) {
    console.log("📝 Autocompletando formulario…");
    console.log("📊 Registro:", registro);

    document.getElementById("edicionOrdenCompra").value = registro["ORDEN DE COMPRA"] || "";
    document.getElementById("edicionZona").value = registro["ZONAS"] || "";
    document.getElementById("edicionNit").value = registro["NIT"] || "";
    document.getElementById("edicionTerritorial").value = registro["TERRITORIAL"] || "";
    document.getElementById("edicionFechaInicio").value =excelSerialToDate(registro['FECHA DE INICIO']);
    document.getElementById("edicionFechaTerminacion").value =excelSerialToDate(registro['FECHA DE TERMINACION']);
    document.getElementById("edicionObjeto").value = registro["OBJETO"] || "";
    document.getElementById("edicionProveedor").value = registro["PROVEEDOR"] || "";
    document.getElementById("edicionSupervisor").value = registro["SUPERVISOR"] || "";
    document.getElementById("edicionApoyoSupervision").value = registro["APOYO A LA SUPERVISION"] || "";
    document.getElementById("edicionLinkColombiaCompra").value = registro["LINK DE COLOMBIA COMPRA"] || "";

    console.log("✅ Formulario llenado correctamente");
}

function excelSerialToDate(serial) {
    if (!serial || isNaN(serial)) return "";

    const excelEpoch = new Date(1899, 11, 30); // Excel empieza el 30/12/1899
    const fecha = new Date(excelEpoch.getTime() + serial * 86400000);

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // formato que el input <date> sí acepta
}

// ============================
// ACTUALIZAR REGISTRO
// ============================
async function handleActualizar() {
    const estado = document.getElementById("estadoTab2");
    const btnActualizar = document.getElementById("btnActualizar");

    if (!validarFormularioTab2()) {
        estado.innerText = "❌ Por favor completa todos los campos obligatorios";
        estado.className = "estado-envio error";
        return;
    }

    if (!registroEnEdicion) {
        estado.innerText = "❌ No hay registro seleccionado";
        estado.className = "estado-envio error";
        return;
    }

    const payload = {
        "id": registroEnEdicion.ID,
        "ordenCompra": document.getElementById("edicionOrdenCompra").value,
        "zona": document.getElementById("edicionZona").value,
        "nit": document.getElementById("edicionNit").value,
        "territorial": document.getElementById("edicionTerritorial").value,
        "fechaInicio": document.getElementById("edicionFechaInicio").value,
        "fechaTerminacion": document.getElementById("edicionFechaTerminacion").value,
        "objeto": document.getElementById("edicionObjeto").value,
        "proveedor": document.getElementById("edicionProveedor").value,
        "supervisor": document.getElementById("edicionSupervisor").value,
        "apoyoSupervision": document.getElementById("edicionApoyoSupervision").value,
        "linkColombiaCompra": document.getElementById("edicionLinkColombiaCompra").value,
        "periodoSelect": document.getElementById("periodoSelectTab2").value,
        "accion": "EDITAR"
    };

    console.log("📤 TAB 2 - Enviando actualización:", payload);

    btnActualizar.disabled = true;
    const originalText = btnActualizar.innerText;
    btnActualizar.innerText = "Actualizando...";
    estado.innerText = "⏳ Actualizando registro...";
    estado.className = "estado-envio cargando";

    try {
        const resp = await fetch(POWER_AUTOMATE_URLS.EDITAR, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(`HTTP ${resp.status}: ${errorText}`);
        }

        let result;
        try {
            const responseText = await resp.text();
            result = responseText ? JSON.parse(responseText) : { success: true };
        } catch (parseError) {
            result = { success: true };
        }

        console.log("✅ Respuesta actualización:", result);
        
        estado.innerText = "✔ Registro actualizado correctamente";
        estado.className = "estado-envio exito";

        setTimeout(() => {
            onCambioPeriodoTab2();
            estado.innerText = "";
        }, 2000);

    } catch (err) {
        console.error("❌ Error actualizando:", err);
        estado.innerText = "❌ Error al actualizar el registro";
        estado.className = "estado-envio error";
    } finally {
        btnActualizar.disabled = false;
        btnActualizar.innerText = originalText;
    }
}

// ============================
// ELIMINAR REGISTRO
// ============================
async function handleEliminar() {
    const estado = document.getElementById("estadoTab2");
    const btnEliminar = document.getElementById("btnEliminar");
    const ordenCompra = document.getElementById("edicionOrdenCompra").value;

    if (!registroEnEdicion) {
        estado.innerText = "❌ No hay registro seleccionado";
        estado.className = "estado-envio error";
        return;
    }

    if (!confirm(`⚠️ ¿Seguro que deseas ELIMINAR la orden: ${ordenCompra}?\n\nEsta acción NO SE PUEDE DESHACER`)) {
        return;
    }

    const payload = {
        "id": registroEnEdicion.ID,
        "ordenCompra": ordenCompra,
        "accion": "ELIMINAR"
    };

    console.log("📤 TAB 2 - Enviando eliminación:", payload);

    btnEliminar.disabled = true;
    const originalText = btnEliminar.innerText;
    btnEliminar.innerText = "Eliminando...";
    estado.innerText = "⏳ Eliminando registro...";
    estado.className = "estado-envio cargando";

    try {
        const resp = await fetch(POWER_AUTOMATE_URLS.ELIMINAR, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(`HTTP ${resp.status}: ${errorText}`);
        }

        let result;
        try {
            const responseText = await resp.text();
            result = responseText ? JSON.parse(responseText) : { success: true };
        } catch (parseError) {
            result = { success: true };
        }

        console.log("✅ Respuesta eliminación:", result);
        
        estado.innerText = "✔ Registro eliminado correctamente";
        estado.className = "estado-envio exito";

        setTimeout(() => {
            limpiarFormularioTab2();
            onCambioPeriodoTab2();
            estado.innerText = "";
        }, 2000);

    } catch (err) {
        console.error("❌ Error eliminando:", err);
        estado.innerText = "❌ Error al eliminar el registro";
        estado.className = "estado-envio error";
    } finally {
        btnEliminar.disabled = false;
        btnEliminar.innerText = originalText;
    }
}
