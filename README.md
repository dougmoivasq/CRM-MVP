# 📇 Mini CRM con Google Sheets

CRM ligero para pequeños negocios: gestiona **clientes**, **oportunidades de venta** (pipeline Kanban) y **actividades**, usando **Google Sheets como base de datos** y **Google Apps Script** como backend. Desarrollado con apoyo de Claude Code.

## Funcionalidades
- 📊 Dashboard con KPIs (clientes, pipeline, ventas ganadas)
- 👤 CRUD de clientes con búsqueda y validación de email
- 🗂️ Pipeline Kanban con arrastrar y soltar (Prospecto → Ganado/Perdido)
- 📝 Registro de llamadas, emails y reuniones

## Arquitectura
```
Navegador (Index.html: HTML + CSS + JS)
        │  google.script.run
        ▼
Apps Script (Code.gs: lógica + validaciones)
        │  SpreadsheetApp
        ▼
Google Sheets (hojas: Clientes, Oportunidades, Actividades)
```
Cada hoja funciona como una tabla; la columna `id` es la clave primaria y `cliente_id` la clave foránea.

## Instalación (5 minutos)
1. Crea una hoja nueva en Google Sheets.
2. **Extensiones → Apps Script**.
3. Pega `src/Code.gs` en `Code.gs`. Crea un archivo HTML llamado `Index` y pega `src/Index.html`.
4. Ejecuta la función `inicializar` (autoriza los permisos).
5. **Implementar → Nueva implementación → Aplicación web** → acceso: "Solo yo" → copia la URL.

## Decisiones técnicas
- **Google Sheets como BD:** cero costo, cero servidores y los datos se pueden ver y editar directamente.
- **Capa de datos genérica** (`listar_`, `crear_`, `actualizar_`, `eliminar_`): un solo código sirve para las 3 tablas.
- **UI optimista** en el Kanban: la tarjeta se mueve al instante y luego se guarda.

## Mejoras futuras
Autenticación por roles, exportar a PDF y recordatorios por email.
