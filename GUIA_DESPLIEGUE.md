# 🚀 Guía de Despliegue: Nexus Platinum en Vercel

Sigue estos pasos **en orden**. Es muy fácil. Estimado: **15 minutos**.

---

## PASO 1️⃣: Actualizar Google Apps Script (5 min)

### 1.1 Abre el editor de Apps Script
- Ve a **script.google.com**
- Abre tu proyecto existente

### 1.2 Reemplaza Code.gs
1. Elimina TODO el contenido de `Code.gs`
2. Copia este archivo y pégalo entero:
   - **Archivo:** `Code_API.gs` (el que creé para ti)
3. Dale **Guardar** (Ctrl+S)

✅ **Listo**, el script ya tiene modo API

---

## PASO 2️⃣: Publicar como Web App (5 min)

### 2.1 Publicar
1. En el menú superior, haz clic en **"Implementar"** (o Deploy)
2. Selecciona **"Nueva implementación"**

### 2.2 Configurar
- **Tipo:** "Aplicación web"
- **Ejecutar como:** Tu email
- **Quién tiene acceso:** "Cualquier persona"
- Haz clic en **"Implementar"**

### 2.3 Copiar URL
1. Apps Script te mostrará un diálogo con la **URL de implementación**
2. **COPIA ESTA URL COMPLETA**
   - Algo como: `https://script.google.com/macros/s/ABC123XYZ/exec`

### 2.4 Guardar la URL
Guárdala en un lugar seguro (Notepad). La usarás en el siguiente paso.

---

## PASO 3️⃣: Preparar los archivos (3 min)

### 3.1 Descarga estos archivos
Desde la carpeta del proyecto (donde está `Code.gs`):

- ✅ `index_vercel.html` → **Renómbralo a `index.html`**
- ✅ `config.js`

### 3.2 Edita config.js
1. Abre el archivo `config.js` con Notepad (o VS Code)
2. Busca esta línea:
   ```js
   window.API_URL = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
   ```
3. **Reemplaza `YOUR_ID_HERE`** con la URL que copiaste en el Paso 2.3
   - Queda así:
   ```js
   window.API_URL = 'https://script.google.com/macros/s/ABC123XYZ/exec';
   ```
4. **Guarda el archivo** (Ctrl+S)

---

## PASO 4️⃣: Subir a GitHub (3 min)

### 4.1 Crea cuenta en GitHub (si no tienes)
- Ve a **github.com**
- Haz clic en "Sign Up"
- Completa el registro (es gratis)

### 4.2 Crea un nuevo repositorio
1. Haz clic en el **ícono + (arriba a la derecha)** → "New repository"
2. Llámalo: **`nexus-platinum`**
3. Selecciona **"Public"**
4. Haz clic en **"Create repository"**

### 4.3 Sube tus archivos
1. GitHub te mostrará instrucciones. Sigue esta opción más fácil:
   - Haz clic en **"uploading an existing file"**
   - Selecciona y arrastra estos dos archivos:
     - `index.html`
     - `config.js`
   - Haz clic en **"Commit changes"**

✅ **Los archivos están en GitHub**

---

## PASO 5️⃣: Desplegar en Vercel (3 min)

### 5.1 Ve a Vercel
- Abre **vercel.com**

### 5.2 Conéctate con GitHub
1. Haz clic en **"Sign Up"** (elige "Continue with GitHub")
2. Autoriza Vercel para acceder a GitHub
3. Vercel te dará acceso automático a tus repositorios

### 5.3 Importa el proyecto
1. Haz clic en **"Add New..."** → **"Project"**
2. Busca el repositorio `nexus-platinum` y selecciónalo
3. Deja la configuración por defecto
4. Haz clic en **"Deploy"**

### 5.4 ¡Listo! 🎉
- Vercel mostrará un mensaje: **"Deployment Successful"**
- Te dará un URL público como: `https://nexus-platinum.vercel.app`
- **ESTE ES TU NUEVO APP**

---

## PASO 6️⃣: Usa tu app

### 6.1 Abre el link
- Abre en el navegador: `https://nexus-platinum.vercel.app` (o tu URL)

### 6.2 Prueba

✅ **Búsqueda individual:**
- Escribe un nombre en la barra de búsqueda
- Debe mostrarte el estado de formularios

✅ **Cargar CSV (nueva función):**
- Vete a la pestaña "📤 Cargar CSV"
- Sube un archivo CSV con nombres o IDs
- Debe mostrar tabla con estado de cada participante

✅ **Admin:**
- Botón "Sincronizar Kobo" debe funcionar
- Botón "Diagnóstico" debe mostrar estado

---

## ❓ Si algo no funciona

### Error: "API_URL is not defined"
- Asegúrate de que `config.js` tiene la URL correcta
- Y que el archivo HTML **importa** config.js antes de usarlo
- En el HTML busca: `<script src="config.js"></script>` → debe estar ANTES del script principal

### Error: "No se puede conectar a Apps Script"
- Verifica que copiaste la URL correctamente en `config.js`
- Prueba la URL directamente en el navegador:
  - `https://script.google.com/macros/s/ABC123XYZ/exec?action=stats`
  - Debe mostrarte un JSON

### Búsqueda no devuelve resultados
- Ve a tu Google Sheet
- Asegúrate que tiene datos en las columnas esperadas (Nombre, ID, DPI, etc.)
- Haz clic en "Sincronizar Kobo" desde la app

---

## 📝 Resumen de cambios

| Componente | Antes | Ahora |
|---|---|---|
| **Hosting** | Google Sites (complejo) | Vercel (gratis) |
| **Backend** | Apps Script como web app | Apps Script como API REST |
| **Frontend** | HTML en Google | HTML/JS en Vercel |
| **Búsqueda** | Solo individual | Individual + CSV en masa |
| **Diseño** | Funcional | Mejorado |
| **URL** | Long script.google.com URL | Clean nexus-platinum.vercel.app |

---

## 🎯 ¿Qué pasó técnicamente?

1. **Apps Script ahora es una API**: Responde con JSON cuando Vercel le pregunta
2. **Vercel hostea tu interfaz**: HTML/CSS/JS puro, desplegado en segundos
3. **CSV upload es nuevo**: Busca en batch (5 en paralelo) y muestra tabla
4. **Toda la lógica sigue igual**: Mismo motor de búsqueda fuzzy, mismo sync con Kobo

---

¿Preguntas? 💬 Avísame en qué paso te quedas atrapado.

¡Buena suerte! 🚀
