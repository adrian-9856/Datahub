/**
 * ============================================================
 * NEXUS PLATINUM - Code.gs (VERSIÓN COMPLETA TODO EN UNO)
 * Búsqueda, API REST, Sincronización, Automatización
 * IMPORTANTE: Este archivo reemplaza Code.gs Y Sync.gs
 * ============================================================
 */

// --- CONFIGURACIÓN GLOBAL ---
var SPREADSHEET_ID = '1N_Ruxvcq7FcMJnjPPZ9se2rLsIjGVTDdO84q0Ke9f1I';
var API_KEY        = '64cc018b88067397addd36b09288be8b6539cf39';
var KOBO_BASE_URL  = 'https://kf.kobotoolbox.org/api/v2';

var FORM_MAP = {
  'Formulario de Apoyo Emocional - Primera Vez (2025)':       'avCCqTKmU858AQGYcRVsUs',
  'Línea de Base - Entrada (2025)':                           'ayA7xgM5zW4wgj3gUJp4uj',
  'Formulario de Apoyo Emocional - Siguientes Veces (2025)':  'aUSsqK2cVWVMmAqLtzLSsY',
  'Formulario de Bienestar (2026)':                           'aCxASXMEvmmwTfSM2ru4w9',
  'Línea de Base - Entrada (2026)':                           'afTQZQR8NpPCZ68YJe75eE'
};

// ============================================================
// SECCIÓN 1: WEB (doGet - API REST + HTML)
// ============================================================

function doGet(e) {
  try {
    var action = (e && e.parameter) ? e.parameter.action : null;

    // Sin action = devolver HTML
    if (!action) {
      return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('Nexus Platinum | Creamos Datahub')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }

    // Con action = API REST
    switch(action) {
      case 'search':
        var query = (e.parameter.q || '').toString();
        return jsonResponse(searchPerson(query));

      case 'stats':
        return jsonResponse(getSystemStats());

      case 'names':
        return jsonResponse(getParticipantNames());

      case 'sync':
        return jsonResponse(ACTUALIZAR_TODO());

      case 'diagnostico':
        return jsonResponse(DIAGNOSTICO());

      default:
        return jsonResponse({ success: false, message: 'Acción no válida: ' + action });
    }
  } catch(err) {
    return jsonResponse({ success: false, message: 'Error: ' + err.message });
  }
}

// Helper: JSON response
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// SECCIÓN 2: MENÚ EN GOOGLE SHEETS
// ============================================================

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🚀 Nexus Admin')
      .addItem('🔄 Sincronizar TODO (Kobo)',         'ACTUALIZAR_TODO')
      .addSeparator()
      .addItem('🔗 Actualizar Links de Formularios', 'ACTUALIZAR_LINKS')
      .addItem('🔍 Ver URLs Guardadas',              'VER_URLS')
      .addSeparator()
      .addItem('🩺 Diagnóstico de Conexión',         'DIAGNOSTICO')
      .addSeparator()
      .addItem('⏰ Activar Auto-Sync (cada 5 min)',  'ESTABLECER_AUTOMATIZACION')
      .addItem('🛑 Detener Auto-Sync',               'DETENER_AUTOMATIZACION')
      .addToUi();
  } catch(e) { Logger.log('onOpen error: ' + e.message); }
}

// ============================================================
// SECCIÓN 3: ESTADÍSTICAS
// ============================================================

function getSystemStats() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const props = PropertiesService.getScriptProperties().getProperties();
    const names = new Set();

    ss.getSheets().forEach(sheet => {
      const data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        const nIdx = data[0].findIndex(h => h.toString().toLowerCase().includes('nombre'));
        if (nIdx !== -1) data.slice(1).forEach(r => r[nIdx] && names.add(r[nIdx].toString().trim()));
      }
    });

    return {
      success:           true,
      totalParticipants: names.size,
      totalForms:        Object.keys(FORM_MAP).length,
      lastRefresh:       props['LAST_REFRESH'] || 'Pendiente'
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ============================================================
// SECCIÓN 4: BÚSQUEDA
// ============================================================

function searchPerson(query) {
  if (!query || query.trim() === '') {
    return { success: false, message: 'Consulta vacía.' };
  }

  const qClean = cleanText(query);
  const qWords = qClean.split(' ').filter(w => w.length > 2);
  const consolidated = {};
  const enketoUrls   = getEnketoUrls();

  try {
    const ss     = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();

    // Mapa de admisión
    const admissionMapByID   = {};
    const admissionMapByName = {};

    sheets.forEach(sheet => {
      const data = sheet.getDataRange().getDisplayValues();
      if (data.length < 2) return;
      const headers = data[0];
      let colID = -1, colNombre = -1, colAnio = -1, colEdad = -1, colDPI = -1;

      headers.forEach((h, i) => {
        const ht = cleanText(h);
        if ((ht.includes('creamos') && ht.includes('id')) || ht === 'creamos_id') colID    = i;
        if (ht.includes('nombre'))                                                colNombre  = i;
        if (ht.includes('ingreso'))                                               colAnio    = i;
        if (ht === 'edad' || ht === 'age')                                        colEdad    = i;
        if (ht.includes('dpi') || (ht.includes('cedula') && !ht.includes('id'))) colDPI     = i;
      });

      if (colID !== -1 || colNombre !== -1) {
        for (let i = 1; i < data.length; i++) {
          const info = {
            anio:       colAnio   !== -1 ? data[i][colAnio]   : 'N/R',
            edad:       colEdad   !== -1 ? data[i][colEdad]   : 'N/D',
            dpi:        colDPI    !== -1 ? data[i][colDPI]    : 'N/D',
            fullName:   colNombre !== -1 ? data[i][colNombre].toString().trim() : '',
            originalID: colID     !== -1 ? data[i][colID].toString().trim()     : ''
          };
          if (info.originalID) admissionMapByID[info.originalID.toLowerCase()]   = info;
          if (info.fullName)   admissionMapByName[cleanText(info.fullName)]       = info;
        }
      }
    });

    // Búsqueda en hojas
    sheets.forEach(sheet => {
      const sName      = sheet.getName();
      const sNameClean = cleanText(sName);
      const data       = sheet.getDataRange().getDisplayValues();
      if (data.length < 2) return;

      let type = null;
      if      (sNameClean.includes('primera'))    type = 'Formulario de Apoyo Emocional - Primera Vez (2025)';
      else if (sNameClean.includes('siguientes')) type = 'Formulario de Apoyo Emocional - Siguientes Veces (2025)';
      else if (sNameClean.includes('bienestar'))  type = 'Formulario de Bienestar (2026)';
      else if (sNameClean.includes('linea') || sNameClean.includes('base')) {
        type = sNameClean.includes('2026') ? 'Línea de Base - Entrada (2026)' : 'Línea de Base - Entrada (2025)';
      }

      const headers = data[0];
      let colNombre = -1, colApellido = -1, colID = -1;

      headers.forEach((h, i) => {
        const ht = cleanText(h);
        const isSysID = ht.startsWith('_') || ht.includes('uuid') || ht.includes('submission') || ht.includes('device');
        if ((ht.includes('nombre') || ht.includes('participante') || ht.includes('joven')) && colNombre === -1) colNombre   = i;
        if (ht.includes('apellido') && colApellido === -1)                                                      colApellido = i;
        if (!isSysID) {
          if (ht.includes('creamos'))                              colID = i;
          else if ((ht.includes('id') || ht.includes('cedula') || ht.includes('codigo')) && colID === -1) colID = i;
        }
      });

      for (let i = 1; i < data.length; i++) {
        const row      = data[i];
        const rawName  = colNombre   !== -1 ? row[colNombre].toString().trim() + (colApellido !== -1 ? ' ' + row[colApellido].toString().trim() : '') : '';
        const cleanN   = cleanText(rawName);
        const rawID    = colID !== -1 ? row[colID].toString().trim() : '';
        const cleanI   = rawID.toLowerCase();
        const rowStr   = cleanText(row.join(' '));

        let score = 0;
        if      ((cleanI && cleanI === qClean) || (cleanN && cleanN === qClean)) score = 1000;
        else if (cleanN && cleanN.startsWith(qClean))                             score = 500;
        else if (cleanN && cleanN.includes(qClean))                               score = 300;
        else if (rowStr.includes(qClean))                                          score = 100;
        else if (qWords.length > 0 && qWords.every(w => rawName.split(' ').some(nw => getSimilarity(w, nw) > 0.8))) score = 50;

        if (score === 0) continue;

        let admData = admissionMapByID[cleanI] || admissionMapByName[cleanN] || null;
        if (!admData && cleanN.length > 5) {
          const match = Object.keys(admissionMapByName).find(k => getSimilarity(k, cleanN) > 0.90);
          if (match) admData = admissionMapByName[match];
        }

        const nameShow = admData ? admData.fullName : (rawName || 'Participante');
        const pID      = admData ? admData.originalID : (rawID || 'S/ID');
        const sysID    = cleanText(nameShow) + cleanText(pID);

        if (!consolidated[sysID]) {
          consolidated[sysID] = {
            Nombre:      nameShow,
            ID:          pID,
            AgnoIngreso: admData ? admData.anio  : 'N/R',
            Edad:        admData ? admData.edad   : 'N/D',
            DPI:         admData ? admData.dpi    : 'N/D',
            Score:       score,
            Formularios: {}
          };
          for (const fname of Object.keys(FORM_MAP)) {
            consolidated[sysID].Formularios[fname] = { status: 'NO', url: enketoUrls[fname] || '' };
          }
        } else {
          if (score > consolidated[sysID].Score) consolidated[sysID].Score = score;
        }

        if (type) consolidated[sysID].Formularios[type].status = 'SI';
      }
    });

    // Fusión de duplicados
    const allKeys = Object.keys(consolidated).sort((a, b) => consolidated[b].Score - consolidated[a].Score);
    const merged  = {};
    const done    = new Set();

    for (let i = 0; i < allKeys.length; i++) {
      if (done.has(allKeys[i])) continue;
      const master = consolidated[allKeys[i]];
      merged[allKeys[i]] = master;
      done.add(allKeys[i]);

      for (let j = i + 1; j < allKeys.length; j++) {
        if (done.has(allKeys[j])) continue;
        const dup     = consolidated[allKeys[j]];
        const nameSim = getSimilarity(master.Nombre, dup.Nombre);
        const idMatch = master.ID.length > 2 && master.ID !== 'S/ID' && cleanText(master.ID) === cleanText(dup.ID);

        if (nameSim > 0.90 || idMatch) {
          for (const f in dup.Formularios) {
            if (dup.Formularios[f].status === 'SI') master.Formularios[f].status = 'SI';
          }
          done.add(allKeys[j]);
        }
      }
    }

    const results = Object.values(merged).sort((a, b) => b.Score - a.Score);
    return results.length > 0
      ? { success: true, data: results }
      : { success: false, message: 'No se encontraron resultados para: "' + query + '"' };

  } catch (e) {
    return { success: false, message: 'Error de búsqueda: ' + e.message };
  }
}

// ============================================================
// SECCIÓN 5: AUTOCOMPLETADO
// ============================================================

function getParticipantNames() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const names = new Set();

    ss.getSheets().forEach(sheet => {
      const data = sheet.getDataRange().getDisplayValues();
      if (data.length < 2) return;
      const nIdx = data[0].findIndex(h => cleanText(h).includes('nombre'));
      if (nIdx !== -1) {
        for (let i = 1; i < data.length; i++) {
          const n = data[i][nIdx] ? data[i][nIdx].toString().trim() : '';
          if (n.length > 2) names.add(n);
        }
      }
    });
    return Array.from(names).sort();
  } catch (e) {
    return [];
  }
}

// ============================================================
// SECCIÓN 6: SINCRONIZACIÓN CON KOBO
// ============================================================

function ACTUALIZAR_TODO() {
  let ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch(e) {
    return { success: false, message: '❌ No se pudo abrir la hoja. Error: ' + e.message };
  }

  const options = { headers: { Authorization: 'Token ' + API_KEY }, muteHttpExceptions: true };
  const props   = PropertiesService.getScriptProperties();
  let ok = 0, errors = [];

  for (const [nombreHoja, uid] of Object.entries(FORM_MAP)) {
    try {
      Logger.log('▶ Sincronizando: ' + nombreHoja);

      // 1. Obtener Link Enketo
      const assetResp = UrlFetchApp.fetch(KOBO_BASE_URL + '/assets/' + uid + '/?format=json', options);
      if (assetResp.getResponseCode() === 200) {
        const enketoUrl = JSON.parse(assetResp.getContentText()).deployment__links?.url;
        if (enketoUrl) props.setProperty('ENKETO_' + nombreHoja, enketoUrl);
      }

      // 2. Descargar datos con paginación
      let allResults = [];
      let nextUrl    = KOBO_BASE_URL + '/assets/' + uid + '/data.json';
      while (nextUrl) {
        const resp = UrlFetchApp.fetch(nextUrl, options);
        if (resp.getResponseCode() !== 200) throw new Error('HTTP ' + resp.getResponseCode());
        const json = JSON.parse(resp.getContentText());
        allResults = allResults.concat(json.results || (Array.isArray(json) ? json : []));
        nextUrl    = json.next || null;
      }

      // 3. Escribir en hoja
      let hoja = ss.getSheetByName(nombreHoja) || ss.insertSheet(nombreHoja);
      hoja.clearContents();
      if (allResults.length > 0) {
        const headers = Array.from(new Set(allResults.flatMap(r => Object.keys(r))));
        const matrix  = [headers].concat(allResults.map(r =>
          headers.map(h => { const v = r[h]; return (v === null || v === undefined) ? '' : (typeof v === 'object' ? JSON.stringify(v) : v); })
        ));
        hoja.getRange(1, 1, matrix.length, matrix[0].length).setValues(matrix);
      }
      Logger.log('✅ ' + nombreHoja + ': ' + allResults.length + ' registros.');
      ok++;

    } catch(e) {
      Logger.log('❌ ' + nombreHoja + ': ' + e.message);
      errors.push(nombreHoja + ': ' + e.message);
    }
  }

  props.setProperty('LAST_REFRESH', new Date().toLocaleString());

  let message = '✅ Sincronización completa.\n✔ Exitosos: ' + ok + '/' + Object.keys(FORM_MAP).length;
  if (errors.length > 0) message += '\n\n⚠️ Errores:\n' + errors.join('\n');

  safeAlert(message);
  return { success: true, message: message };
}

// ============================================================
// SECCIÓN 7: HELPERS
// ============================================================

function ACTUALIZAR_LINKS() {
  const result = refreshSystem();
  safeAlert(result.message);
}

function VER_URLS() {
  const props = PropertiesService.getScriptProperties().getProperties();
  let msg = 'Estado de URLs:\n\n';
  for (const name of Object.keys(FORM_MAP)) {
    const ok = props['ENKETO_' + name] && props['ENKETO_' + name].startsWith('http');
    msg += (ok ? '✅' : '❌') + ' ' + name + '\n';
  }
  safeAlert(msg);
}

function DIAGNOSTICO() {
  const options = { headers: { Authorization: 'Token ' + API_KEY }, muteHttpExceptions: true };
  let report = {
    apiKey: false,
    forms: {},
    sheets: false,
    errors: []
  };

  try {
    const resp = UrlFetchApp.fetch(KOBO_BASE_URL + '/assets/?format=json&limit=1', options);
    if (resp.getResponseCode() === 200) report.apiKey = true;
    else report.errors.push('API Key inválida');
  } catch(e) {
    report.errors.push('Sin conexión a Internet');
  }

  for (const [nombre, uid] of Object.entries(FORM_MAP)) {
    try {
      const resp = UrlFetchApp.fetch(KOBO_BASE_URL + '/assets/' + uid + '/?format=json', options);
      if (resp.getResponseCode() === 200) {
        const data = JSON.parse(resp.getContentText());
        report.forms[nombre] = { ok: true, count: data.deployment__submission_count || 0 };
      } else {
        report.forms[nombre] = { ok: false, error: 'HTTP ' + resp.getResponseCode() };
      }
    } catch(e) {
      report.forms[nombre] = { ok: false, error: e.message };
    }
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    report.sheets = true;
  } catch(e) {
    report.errors.push('Google Sheet no accesible');
  }

  let msg = '🩺 DIAGNÓSTICO:\n';
  msg += (report.apiKey ? '✅' : '❌') + ' Kobo API\n';
  msg += (report.sheets ? '✅' : '❌') + ' Google Sheet\n\n';
  for (const [name, data] of Object.entries(report.forms)) {
    msg += (data.ok ? '✅' : '❌') + ' ' + name + ' (' + (data.count || 0) + ' registros)\n';
  }

  safeAlert(msg);
  return { success: true, diagnostics: report, message: msg };
}

// ============================================================
// SECCIÓN 8: AUTO-SYNC
// ============================================================

function ESTABLECER_AUTOMATIZACION() {
  DETENER_AUTOMATIZACION();
  ScriptApp.newTrigger('ACTUALIZAR_TODO').timeBased().everyMinutes(5).create();
  safeAlert('⏰ Auto-Sync activada (cada 5 minutos).');
}

function DETENER_AUTOMATIZACION() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'ACTUALIZAR_TODO') ScriptApp.deleteTrigger(t);
  });
  safeAlert('🛑 Auto-Sync desactivada.');
}

// ============================================================
// SECCIÓN 9: UTILIDADES
// ============================================================

function getEnketoUrls() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const urls  = {};
  for (const name of Object.keys(FORM_MAP)) {
    const key = 'ENKETO_' + name;
    if (props[key] && props[key].startsWith('http')) urls[name] = props[key];
  }
  return urls;
}

function refreshSystem() {
  const props   = PropertiesService.getScriptProperties();
  const options = { headers: { Authorization: 'Token ' + API_KEY }, muteHttpExceptions: true };
  let ok = 0;

  for (const [name, uid] of Object.entries(FORM_MAP)) {
    try {
      const resp = UrlFetchApp.fetch(`${KOBO_BASE_URL}/assets/${uid}/?format=json`, options);
      if (resp.getResponseCode() === 200) {
        const url = JSON.parse(resp.getContentText()).deployment__links?.url;
        if (url) { props.setProperty('ENKETO_' + name, url); ok++; }
      }
    } catch (e) { Logger.log('refreshSystem error: ' + name + ' - ' + e.message); }
  }
  props.setProperty('LAST_REFRESH', new Date().toLocaleString());
  return { success: true, message: ok + '/' + Object.keys(FORM_MAP).length + ' formularios listos.' };
}

function cleanText(text) {
  if (text === null || text === undefined) return '';
  return text.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function getSimilarity(s1, s2) {
  const a = cleanText(s1);
  const b = cleanText(s2);
  if (a === b) return 1.0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  const costs = [];
  for (let i = 0; i <= a.length; i++) {
    let last = i;
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) { costs[j] = j; }
      else if (j > 0) {
        let nv = costs[j - 1];
        if (a[i-1] !== b[j-1]) nv = Math.min(nv, last, costs[j]) + 1;
        costs[j-1] = last;
        last = nv;
      }
    }
    if (i > 0) costs[b.length] = last;
  }
  return (longer.length - costs[b.length]) / longer.length;
}

function safeAlert(msg) {
  try { SpreadsheetApp.getUi().alert(msg); }
  catch(e) { Logger.log('ALERT: ' + msg); }
}

function isSimilar(s1, s2) { return getSimilarity(s1, s2) > 0.8; }
