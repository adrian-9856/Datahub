# 🚀 NEXUS PLATINUM V2 - Tu Nueva App en Vercel

Migración completa de Google Sites → **Vercel** con mejoras.

---

## 📋 ¿Qué tienes?

Creé **todo lo que necesitas** para migrar tu app a Vercel en 15 minutos.

### Archivos creados para ti:

```
📁 proyecto formularios/
├── Code_API.gs              ← Backend mejorado (copiar a Apps Script)
├── index_vercel.html        ← Frontend nuevo (renombrar a index.html)
├── config.js                ← Configuración (cambiar 1 línea)
├── CHECKLIST_RAPIDO.md      ← START HERE (checklist rápido)
├── GUIA_DESPLIEGUE.md       ← Instrucciones detalladas
├── CAMBIOS_Y_NOVEDADES.md   ← Qué es nuevo / qué cambió
└── README_NEXUS_V2.md       ← Este archivo
```

---

## 🎯 ¿Por qué hacer esto?

### Antes (Google Sites)
❌ Hosting complejo  
❌ Limited customization  
❌ Solo búsqueda individual  
❌ Lento y burocrático  

### Ahora (Vercel)
✅ Hosting **gratis y rápido**  
✅ URL propia y profesional  
✅ **Búsqueda + CSV en masa**  
✅ Diseño moderno  
✅ Controlas todo  

---

## 🚀 ¿Cómo empezar?

### OPCIÓN A: Si eres impaciente
1. Abre **`CHECKLIST_RAPIDO.md`**
2. Sigue los 5 pasos
3. Listo en 15 min

### OPCIÓN B: Si quieres entender todo
1. Abre **`CAMBIOS_Y_NOVEDADES.md`** - entiende qué cambió
2. Abre **`GUIA_DESPLIEGUE.md`** - sigue los pasos detallados
3. Listo en 30 min

---

## 📚 Archivo por archivo

### `Code_API.gs`
Versión mejorada de tu `Code.gs` original.

**Qué cambió:**
- Ahora es una **API REST** (responde JSON)
- Cuando Vercel pregunta `?action=search&q=Juan` → te da JSON
- Sigue usando Google Sheets y Kobo igual que antes

**Qué hacer:**
- Copiar todo el contenido
- Pégalo en `Code.gs` en script.google.com
- Guardar

**No toques Sync.gs** - eso sigue igual.

---

### `index_vercel.html`
Tu nueva interfaz (frontend).

**Qué tiene:**
- 🔍 **Búsqueda individual** (igual que antes)
- 📤 **Cargar CSV** (NUEVO - subir listas de gente)
- ⚙️ **Panel Admin** (Sincronizar, Diagnosticar)
- 🎨 **Diseño mejorado** (moderno, responsive)

**Qué hacer:**
1. Renombra `index_vercel.html` → `index.html`
2. Sube este archivo a Vercel (paso 3 en guía)

---

### `config.js`
Configuración simple.

**Qué contiene:**
```js
window.API_URL = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
```

**Qué hacer:**
1. Abre con Notepad
2. Reemplaza `YOUR_ID_HERE` con tu URL de Apps Script
3. Guarda
4. Sube a Vercel

---

## ⚡ Pasos resumidos

### 1️⃣ Apps Script (5 min)
```
script.google.com → Code.gs → Copy Code_API.gs → Guardar
→ Implementar como "Aplicación web" → Copiar URL
```

### 2️⃣ Archivos (3 min)
```
Renombra index_vercel.html → index.html
Edita config.js (pega tu URL de Apps Script)
```

### 3️⃣ GitHub (3 min)
```
github.com → New repo → nexus-platinum → Upload 2 files
(index.html + config.js)
```

### 4️⃣ Vercel (3 min)
```
vercel.com → Connect GitHub → Import nexus-platinum
→ Deploy → ¡Listo! (esperá ~30 seg)
```

---

## ✨ Lo nuevo en v2

### Cargar CSV (Verificación en masa)

**Antes:** Buscabas una persona a la vez.  
**Ahora:** Subes un CSV con 100 personas → ves tabla con estado de todas.

**Cómo:**
1. Vete a pestaña "📤 Cargar CSV"
2. Arrastra tu archivo (debe tener "Nombre" o "ID")
3. Muestra tabla con ✅/❌ de cada formulario
4. Exporta resultados como CSV

**Casos de uso:**
- Auditorías
- Reportes
- Identificar pendientes

### Interfaz organizada

Ahora en 3 pestañas claras:
- 🔍 **BUSCAR** - individual (mejorado)
- 📤 **CARGAR CSV** - en masa (nuevo)
- ⚙️ **ADMIN** - sincronización

### Mejor diseño

| Aspecto | Antes | Ahora |
|---|---|---|
| Responsive | Media | Excelente (funciona en móvil) |
| Colores | Plano | Mejorado |
| Tablas | Inline | Scroll, limpio |
| Velocidad | Lenta | Rápida (CDN) |

---

## 📈 Antes vs Después

| | Google Sites | Vercel |
|---|---|---|
| **Hosting** | Google, complejo | Vercel, gratis |
| **URL** | `script.google.com/macros/s/ID...` | `nexus-platinum.vercel.app` |
| **Búsqueda** | Solo 1 por 1 | 1 por 1 + CSV en masa |
| **Diseño** | Funcional | Moderno |
| **Responsive** | Básico | Perfecto |
| **Control** | Limitado | Total |
| **Mantenimiento** | Difícil | Fácil (GitHub) |

---

## 🔧 Lo que **no cambia**

✅ Tu Google Sheet (datos igual)  
✅ Sincronización con Kobo (igual)  
✅ Motor de búsqueda fuzzy (igual)  
✅ Auto-sync cada 5 min (igual)  
✅ Links de Enketo (igual)  

Todo sigue funcionando. Solo mejora el frontend.

---

## 🎓 Qué aprendes

- Separar **backend (API)** del **frontend**
- Desplegar en **la nube** (Vercel)
- CSV processing en **JavaScript**
- Batch **API calls** para velocidad
- Apps Script como **servicio REST**

---

## ❓ Preguntas frecuentes

### ¿Es realmente gratis?
**Sí.** Vercel es gratis para proyectos como este. Sin límite de usuarios, sin créditos de prueba.

### ¿Mis datos están seguros?
**Sí.** Vercel solo hostea tu interfaz. Los datos siguen en Google Sheets (como siempre). Vercel no accede a tus datos.

### ¿Puedo cambiar el diseño después?
**Sí.** Editas `index.html` en GitHub → Vercel redeploya automáticamente.

### ¿Qué pasa con mi Google Sheet?
**Nada.** Sigue siendo tu base de datos. Vercel solo lee desde Apps Script.

### ¿Es complicado?
**No.** 15 pasos simples. Copiar-pegar y clicks en botones.

---

## 🎯 Tu checklist

- [ ] Leer este archivo (estás aquí ✓)
- [ ] Abre `CHECKLIST_RAPIDO.md` o `GUIA_DESPLIEGUE.md`
- [ ] Sigue los 5 pasos
- [ ] Prueba tu nueva app
- [ ] ¡Comparte tu URL!

---

## 📞 Soporte

Si algo no funciona:

1. **Lee** `GUIA_DESPLIEGUE.md` (hay troubleshooting)
2. **Verifica:**
   - ¿`config.js` tiene URL correcta?
   - ¿Apps Script está publicado?
   - ¿Google Sheet tiene datos?
3. **Avísame** qué error ves

---

## 🚀 Resultado final

Cuando termines, tendrás:

```
┌─────────────────────────────────────────┐
│  Nexus Platinum v2                      │
│  https://nexus-platinum.vercel.app      │
├─────────────────────────────────────────┤
│                                         │
│  🔍 Buscar           (igual, mejorado) │
│  📤 Cargar CSV       (NUEVO)           │
│  ⚙️ Admin            (igual)           │
│                                         │
│  → Rápido (Vercel CDN)                 │
│  → Gratis (sin límites)                │
│  → Tuyo (URL profesional)              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎉 ¡Veamos!

**Paso 1:**  Abre `CHECKLIST_RAPIDO.md`  
**Paso 2:**  Sigue los pasos  
**Paso 3:**  ¡Que funcione!

Estimado: **15 minutos**

¿Empezamos? 🚀

---

**Adrian**, te creé:
- ✅ Code mejorado (listo para copiar)
- ✅ Frontend nuevo (con CSV upload)
- ✅ Documentación completa
- ✅ Guía paso a paso

**Solo necesitas:** GitHub account (gratis, 2 min) + seguir 5 pasos = **tu app en Vercel**.

¡Mucho éxito! 💪
