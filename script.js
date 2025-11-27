async function handleEnviar(form, boton) {
    const estado = document.getElementById("estadoEnvio");

    // Validación básica
    if (!validarFormulario(form)) {
        estado.innerText = "❌ Por favor complete todos los campos obligatorios.";
        estado.className = "estado-envio error";
        return;
    }

    // ✅ CORREGIR: Mapeo correcto de campos según JSON Schema
    const payload = {
        "ordenCompra": document.getElementById("ordenCompra").value,
        "zona": document.getElementById("zona").value,
        "nit": document.getElementById("nit").value,
        "territorial": document.getElementById("territorial").value,
        "fechalnicio": document.getElementById("fechaInicio").value, // Nota: 'fechalnicio' con 'l'
        "fechalerminacion": document.getElementById("fechaTerminacion").value, // Nota: 'fechalerminacion' con 'l'
        "objeto": document.getElementById("objeto").value,
        "proveedor": document.getElementById("proveedor").value,
        "linkColombiaCompra": document.getElementById("linkColombiaCompra").value
        // Agrega aquí los demás campos que aparecen en tu JSON Schema
    };

    // ✅ CORREGIR: URL COMPLETA
    const POWER_AUTOMATE_URL_FULL = "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/903ebf87d1c0465fafca73e8dd0e9c8a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ySYS6pVeRxRvD_AV6XQlRehosw7yEiCuFo_lp-HWi5A";

    // Mostrar cargando y deshabilitar botón
    boton.disabled = true;
    const originalText = boton.innerText;
    boton.innerText = "Enviando...";
    estado.innerText = "⏳ Enviando información...";
    estado.className = "estado-envio cargando";

    try {
        const resp = await fetch(POWER_AUTOMATE_URL_FULL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
        }

        const result = await resp.json();
        console.log("Respuesta exitosa:", result);
        
        estado.innerText = "✔ Registro enviado correctamente.";
        estado.className = "estado-envio exito";
        form.reset();

    } catch (err) {
        console.error("Error enviando datos:", err);
        estado.innerText = "❌ Error al enviar. Ver consola para detalles.";
        estado.className = "estado-envio error";
    } finally {
        boton.disabled = false;
        boton.innerText = originalText;
    }
}