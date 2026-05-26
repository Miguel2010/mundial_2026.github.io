# Mundial 2026 Porra

Aplicación web construida con `Vite + React + TypeScript` para consultar la clasificación de la porra del Mundial 2026 con una contraseña compartida y despliegue en GitHub Pages.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación local

1. Clona el repositorio.
2. Instala las dependencias:

```bash
npm install
```

## Desarrollo local

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Vite abrirá la aplicación en una URL local, normalmente `http://localhost:5173`.

## Build de producción

Genera la versión lista para publicar:

```bash
npm run build
```

El resultado se crea en `dist/`.

## Despliegue en GitHub Pages

El repositorio incluye el flujo `.github/workflows/deploy.yml` para publicar automáticamente en GitHub Pages.

La URL objetivo es:

`https://miguel2010.github.io/mundial_2026.github.io/`

### Configuración necesaria en GitHub

1. Entra en `Settings > Pages` del repositorio.
2. Selecciona `GitHub Actions` como fuente de despliegue.
3. Haz push a `main` para lanzar el workflow.

## Fuente de datos

La clasificación sigue viviendo en:

`data/clasificacion.csv`

Antes de ejecutar `dev` o `build`, el script `scripts/sync-static.mjs` copia ese CSV a `public/data/clasificacion.csv` para que Vite lo sirva correctamente sin cambiar la ubicación de trabajo del archivo original.

## Cambio de contraseña

La contraseña no se guarda en texto plano dentro del código del frontend. La aplicación compara el hash SHA-256 del valor introducido con el hash configurado en:

`src/features/auth/auth.ts`

Si necesitas cambiar la contraseña:

1. Genera el nuevo hash SHA-256.
2. Sustituye el valor de `PASSWORD_HASH`.
3. Reconstruye o vuelve a desplegar la aplicación.

Ejemplo para generar un hash con Node.js:

```bash
node -e "const crypto=require('crypto'); console.log(crypto.createHash('sha256').update('TU_CONTRASENA').digest('hex'))"
```

## Scripts disponibles

- `npm run dev`: inicia el entorno local.
- `npm run build`: valida TypeScript y genera el build.
- `npm run preview`: sirve el build localmente.
- `npm run typecheck`: ejecuta la comprobación de tipos.

## Notas importantes

- La protección por contraseña es una barrera de acceso en cliente, no autenticación segura de servidor.
- `dist/` y `node_modules/` están ignorados en `.gitignore` porque se generan localmente.
