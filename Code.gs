/**
 * Mini CRM - Backend (Google Apps Script)
 * Base de datos: hojas de Google Sheets (Clientes, Oportunidades, Actividades)
 */
const HOJAS = {
  Clientes:      ['id','nombre','empresa','email','telefono','fecha_alta'],
  Oportunidades: ['id','cliente_id','titulo','monto','etapa','fecha'],
  Actividades:   ['id','cliente_id','tipo','nota','fecha']
};
const ETAPAS = ['Prospecto','Contactado','Propuesta','Ganado','Perdido'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Mini CRM')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('CRM')
    .addItem('Inicializar hojas', 'inicializar')
    .addToUi();
}

/** Crea las hojas con sus encabezados si no existen */
function inicializar() {
  const ss = SpreadsheetApp.getActive();
  Object.entries(HOJAS).forEach(([nombre, cols]) => {
    let h = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    if (h.getLastRow() === 0) {
      h.appendRow(cols);
      h.getRange(1,1,1,cols.length).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('white');
      h.setFrozenRows(1);
    }
  });
}

// ---------- Capa de datos genérica ----------
function hoja_(nombre) { return SpreadsheetApp.getActive().getSheetByName(nombre); }

function listar_(nombre) {
  const datos = hoja_(nombre).getDataRange().getValues();
  const cols = datos.shift();
  return datos.map(f => Object.fromEntries(cols.map((c,i) => [c, f[i] instanceof Date ? f[i].toISOString().slice(0,10) : f[i]])));
}

function crear_(nombre, obj) {
  obj.id = Utilities.getUuid().slice(0,8);
  const hoy = new Date().toISOString().slice(0,10);
  if ('fecha' in obj || HOJAS[nombre].includes('fecha')) obj.fecha = obj.fecha || hoy;
  if (HOJAS[nombre].includes('fecha_alta')) obj.fecha_alta = hoy;
  hoja_(nombre).appendRow(HOJAS[nombre].map(c => obj[c] ?? ''));
  return obj;
}

function actualizar_(nombre, id, cambios) {
  const h = hoja_(nombre), datos = h.getDataRange().getValues(), cols = datos[0];
  const fila = datos.findIndex(f => f[0] === id);
  if (fila < 1) throw new Error('Registro no encontrado');
  Object.entries(cambios).forEach(([k,v]) => {
    const col = cols.indexOf(k);
    if (col > 0) h.getRange(fila+1, col+1).setValue(v);
  });
}

function eliminar_(nombre, id) {
  const h = hoja_(nombre), datos = h.getDataRange().getValues();
  const fila = datos.findIndex(f => f[0] === id);
  if (fila > 0) h.deleteRow(fila+1);
}

// ---------- API expuesta al frontend ----------
function getDatos() {
  return {
    clientes: listar_('Clientes'),
    oportunidades: listar_('Oportunidades'),
    actividades: listar_('Actividades'),
    etapas: ETAPAS
  };
}

function guardarCliente(c) {
  if (!c.nombre || !c.email) throw new Error('Nombre y email son obligatorios');
  if (!/^\S+@\S+\.\S+$/.test(c.email)) throw new Error('Email inválido');
  return c.id ? (actualizar_('Clientes', c.id, c), c) : crear_('Clientes', c);
}
function eliminarCliente(id)   { eliminar_('Clientes', id); }
function crearOportunidad(o)   { o.monto = Number(o.monto) || 0; o.etapa = o.etapa || 'Prospecto'; return crear_('Oportunidades', o); }
function moverEtapa(id, etapa) { actualizar_('Oportunidades', id, { etapa }); }
function crearActividad(a)     { return crear_('Actividades', a); }
