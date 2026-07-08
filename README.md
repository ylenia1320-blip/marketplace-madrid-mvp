# Marketplace Madrid — MVP (proyecto listo para desplegar)

## Importante antes de empezar

Este proyecto guarda los datos en el navegador (localStorage). Eso significa:
- Funciona perfectamente para que TÚ pruebes la app y se la enseñes a alguien desde tu propio dispositivo.
- Si dos personas la abren desde dispositivos distintos (ej. tú desde tu móvil y una discoteca desde su ordenador), CADA UNA verá sus propios datos, no los mismos — porque no hay todavía una base de datos compartida en un servidor.
- Para tener datos compartidos de verdad entre todos los usuarios, el siguiente paso técnico sería añadir un backend (por ejemplo, Supabase, que tiene plan gratuito). Dímelo cuando quieras dar ese paso y te preparo esa versión.

Para la fase de validación en la que estás ahora (enseñar el concepto, probarlo tú misma, recoger feedback), esta versión es perfecta y no necesitas nada más.

## Cómo ponerlo online (sin instalar nada, todo desde el navegador)

### Paso 1 — Crear cuenta en GitHub (gratis)
Ve a https://github.com y crea una cuenta si no tienes una.

### Paso 2 — Crear un repositorio nuevo
1. Botón verde "New" (o "Nuevo repositorio").
2. Ponle un nombre, por ejemplo `marketplace-madrid-mvp`.
3. Que sea público o privado, cualquiera de los dos vale.
4. Crea el repositorio (no hace falta marcar ninguna casilla adicional).

### Paso 3 — Subir estos archivos
1. Dentro del repositorio recién creado, pulsa "uploading an existing file" (o el botón "Add file" → "Upload files").
2. Arrastra TODA la carpeta que te he dado (o todos los archivos y subcarpetas dentro de ella, manteniendo la estructura `src/App.jsx`, `src/main.jsx`, etc.).
3. Confirma la subida ("Commit changes").

### Paso 4 — Crear cuenta en Vercel (gratis)
Ve a https://vercel.com y regístrate usando tu cuenta de GitHub (botón "Continue with GitHub"). Así quedan conectadas automáticamente.

### Paso 5 — Importar el proyecto
1. En Vercel, pulsa "Add New..." → "Project".
2. Busca y selecciona el repositorio `marketplace-madrid-mvp`.
3. Vercel detecta automáticamente que es un proyecto Vite/React — no cambies ninguna configuración.
4. Pulsa "Deploy".

### Paso 6 — Ya está online
En 1-2 minutos tendrás un enlace tipo `marketplace-madrid-mvp.vercel.app` que puedes abrir desde cualquier dispositivo y enviar a quien quieras.

### Para actualizar la app en el futuro
Cada vez que quieras cambiar algo: sube el archivo actualizado a GitHub (Paso 3) y Vercel lo vuelve a publicar solo, automáticamente, en 1-2 minutos.

## Estructura del proyecto

```
marketplace-madrid-mvp/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   └── App.jsx
```

No necesitas tocar ningún archivo salvo que quieras pedirme cambios, en cuyo caso te doy el archivo actualizado y solo tienes que volver a subirlo.
