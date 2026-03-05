// =========================================================================
// SCRIPT DE GOOGLE APPS SCRIPT PARA OBTENER CITAS DE GOOGLE CALENDAR
// =========================================================================
// INSTRUCCIONES:
// 1. Ve a script.google.com y crea un nuevo proyecto.
// 2. Pega este código reemplazando el contenido de "Código.gs".
// 3. EN LA LÍNEA 12 y 13 DE ABAJO: Introduce EXACTAMENTE los nombres de tus 
//    agendas de citas/calendarios que me mostraste en las fotos.
// 4. Haz clic en "Implementar" -> "Nueva Implementación".
// 5. Tipo: "Aplicación web". Ejecutar como: "Tú", Acceso: "Cualquier persona".
// 6. Autoriza los permisos (Avanzado -> Ir a proyecto).
// 7. Copia la URL de la Aplicación Web generada y pégala en app.js en la 
//    variable GAS_CITAS_URL.
// =========================================================================

function doGet(e) {
    // Ajusta estos valores para mirar X días en el futuro y X días en el pasado.
    // Es mejor no cargar miles de citas juntas, cargaremos el mes actual.
    try {
        var today = new Date();
        // Obtener del primer dia del mes anterior al ultimo del mes siguiente
        var startTime = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        var endTime = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        // Obtiene el calendario principal de quien autoriza el script
        var calendar = CalendarApp.getDefaultCalendar();
        var events = calendar.getEvents(startTime, endTime);
        var citas = [];

        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var title = event.getTitle();

            // FILTRO MUY IMPORTANTE: Solo queremos las citas de Tesis Comercial y Coordinacion.
            // Las agendas de citas de Google Calendar a veces agregan el nombre de la persona al final,
            // ej: "Tesis Comercial - Maria Perez", por lo que buscaremos palabras clave.

            var isTesisComercial = title.indexOf("Tesis Comercial") !== -1;
            var isCoordinacion = title.indexOf("Coordinacion Tesis") !== -1 || title.indexOf("Coordinación Tesis") !== -1;

            if (isTesisComercial || isCoordinacion) {

                // Tratamos de buscar un enlace a Google Meet en la ubicación o descripción del evento
                // Por defecto, las agendas de citas configuran una conferencia de Hangouts/Meet
                var meetLink = "";
                var hangoutsLink = "";
                try {
                    hangoutsLink = event.getHangoutLink(); // Obtiene el link de Meet nativo si existe
                } catch (error) { }

                var location = event.getLocation() || "";
                var description = event.getDescription() || "";

                if (hangoutsLink) {
                    meetLink = hangoutsLink;
                } else if (location.indexOf("meet.google.com") !== -1) {
                    meetLink = location;
                } else {
                    // Buscar mediante expresión regular en la descripción
                    var meetRegex = /(https:\/\/meet\.google\.com\/[a-z0-9-]+)/i;
                    var match = description.match(meetRegex);
                    if (match && match.length > 1) {
                        meetLink = match[1];
                    }
                }

                citas.push({
                    title: title,
                    type: isTesisComercial ? "Tesis Comercial" : "Coordinacion Tesis", // Para diferenciar el color
                    startTime: event.getStartTime().toISOString(),
                    endTime: event.getEndTime().toISOString(),
                    meetLink: meetLink,
                    description: description.substring(0, 100) // Un resumen pequeño opcional
                });
            }
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            citas: citas
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Permitir solicitudes pre-flight en CORS
function doOptions(e) {
    var headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
    };
    var params = {
        "message": "CORS preflight answered successfully"
    };

    var result = ContentService.createTextOutput(JSON.stringify(params));
    result.setMimeType(ContentService.MimeType.JSON);

    // En Apps Script estándar a veces no deja mutar headers tan fácil, pero sirve para manejar el event
    return result;
}
