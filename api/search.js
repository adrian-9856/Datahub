// Vercel API Route: /api/search.js
// Esta función es para Vercel, NOT para Google Apps Script

const { google } = require('googleapis');

// Credenciales del service account (vienen como variables de entorno en Vercel)
const serviceAccountKey = {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
};

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['A1:Z1000']
    });

    return response.data.valueRanges || [];
  } catch (error) {
    console.error('Error reading sheets:', error);
    throw error;
  }
}

function cleanText(text) {
  if (!text) return '';
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
      if (i === 0) costs[j] = j;
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

async function searchPerson(query) {
  if (!query) return { success: false, message: 'Consulta vacía' };

  const qClean = cleanText(query);
  const qWords = qClean.split(' ').filter(w => w.length > 2);

  try {
    const sheetData = await getSheetData();
    const results = [];

    // Procesar cada hoja
    sheetData.forEach(sheet => {
      if (!sheet.values || sheet.values.length < 2) return;

      const headers = sheet.values[0];
      const data = sheet.values.slice(1);

      // Encontrar columnas
      let colNombre = -1, colID = -1, colDPI = -1, colEdad = -1, colAnio = -1;

      headers.forEach((h, i) => {
        const ht = cleanText(h);
        if (ht.includes('nombre')) colNombre = i;
        if (ht.includes('id') && !ht.startsWith('_')) colID = i;
        if (ht.includes('dpi')) colDPI = i;
        if (ht.includes('edad')) colEdad = i;
        if (ht.includes('ingreso')) colAnio = i;
      });

      // Buscar coincidencias
      data.forEach(row => {
        if (!row[colNombre]) return;

        const nombre = row[colNombre] ? row[colNombre].toString().trim() : '';
        const cleanN = cleanText(nombre);
        const id = row[colID] ? row[colID].toString().trim() : 'N/A';
        const dpi = row[colDPI] ? row[colDPI].toString().trim() : 'N/D';
        const edad = row[colEdad] ? row[colEdad].toString().trim() : 'N/D';
        const anio = row[colAnio] ? row[colAnio].toString().trim() : 'N/R';

        let score = 0;
        if (cleanN === qClean) score = 1000;
        else if (cleanN.startsWith(qClean)) score = 500;
        else if (cleanN.includes(qClean)) score = 300;
        else if (nombre.includes(query)) score = 100;
        else if (qWords.every(w => nombre.split(' ').some(nw => getSimilarity(w, nw) > 0.8))) score = 50;

        if (score > 0) {
          results.push({
            Nombre: nombre,
            ID: id,
            DPI: dpi,
            Edad: edad,
            AgnoIngreso: anio,
            Score: score,
            Formularios: {
              'Formulario de Apoyo Emocional - Primera Vez (2025)': { status: 'NO' },
              'Formulario de Apoyo Emocional - Siguientes Veces (2025)': { status: 'NO' },
              'Formulario de Bienestar (2026)': { status: 'NO' },
              'Línea de Base - Entrada (2025)': { status: 'NO' },
              'Línea de Base - Entrada (2026)': { status: 'NO' }
            }
          });
        }
      });
    });

    // Ordenar por score
    results.sort((a, b) => b.Score - a.Score);

    return results.length > 0
      ? { success: true, data: results }
      : { success: false, message: 'No encontrado' };

  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ success: false, message: 'Falta parámetro q' });
  }

  const result = await searchPerson(q);
  res.json(result);
}
