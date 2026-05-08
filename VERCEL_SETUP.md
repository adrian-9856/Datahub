# 🚀 Configuración Vercel + Google Sheets API

## ¿Qué vamos a hacer?

En lugar de intentar que Google Apps Script sirva el HTML (que tiene limitaciones), vamos a:

1. **Vercel** = Frontend HTML + API routes (Node.js)
2. **Google Sheets API** = Backend que accede a Google Sheets
3. **Apps Script** = Solo sincronización automática (corre en segundo plano)

---

## 📋 Pasos

### Paso 1: Agregar variables de entorno en Vercel

1. Ve a **vercel.com**
2. Selecciona tu proyecto `Datahub`
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables (copia del archivo JSON que tienes):

```
GOOGLE_PROJECT_ID = creamos-data
GOOGLE_PRIVATE_KEY_ID = 48ffa345a7d7a7a7bf0ca11a2e9c1e826796e2f1
GOOGLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nMIIEvQIBA....\n-----END PRIVATE KEY-----\n
GOOGLE_CLIENT_EMAIL = datahub@creamos-data.iam.gserviceaccount.com
GOOGLE_CLIENT_ID = 111431990865885432217
GOOGLE_CLIENT_X509_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/datahub%40creamos-data.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID = 1N_Ruxvcq7FcMJnjPPZ9se2rLsIjGVTDdO84q0Ke9f1I
```

**Importante:** La `GOOGLE_PRIVATE_KEY` debe tener los saltos de línea como `\n` (literales, no saltos reales).

### Paso 2: Copiar archivos a GitHub

1. Copia estos archivos a tu repo GitHub:
   - `index.html` (el actual)
   - `api/search.js` (el nuevo archivo que creé)
   - `package.json` (crea uno con dependencias)

### Paso 3: Crear package.json

Crea un archivo `package.json` con esto:

```json
{
  "name": "datahub-vercel",
  "version": "1.0.0",
  "dependencies": {
    "googleapis": "^118.0.0"
  }
}
```

### Paso 4: Vercel redeploy automático

Una vez que subas los cambios a GitHub, Vercel redeploya automáticamente.

---

## 🧪 Probar

Una vez deployado, prueba así:

```
https://datahub.vercel.app/api/search?q=Juan
```

Debe devolver JSON con los resultados.

---

## 📝 Estructura final

```
datahub/ (en GitHub)
├── index.html          ← Frontend (busca usando fetch)
├── api/
│   └── search.js       ← API route que busca en Google Sheets
├── package.json        ← Dependencias
└── vercel.json         ← (opcional) Configuración de Vercel
```

---

## ✅ Google Sheets

Tu Google Sheet debe estar compartido con:
```
datahub@creamos-data.iam.gserviceaccount.com
```

(ya debería estarlo si lo hiciste)

---

¿Problemas? Aquí están las soluciones comunes:

- **"Permission denied"** → Comparte el sheet con el email del service account
- **"Private key invalid"** → Asegúrate que `\n` son literales, no saltos de línea reales
- **"API not enabled"** → Ve a Google Cloud Console, habilita "Google Sheets API"
