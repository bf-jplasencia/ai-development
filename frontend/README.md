# Frontend — JWT Auth (React + TypeScript + Vite)

Single Page Application (SPA) que implementa el flujo de autenticación con **JWT** contra el backend FastAPI del workshop. Construida con **React 18**, **TypeScript**, **React Router 6** y **Vite 5**, usando **pnpm** como gestor de paquetes.

La app permite iniciar sesión, guarda los tokens en `sessionStorage`, protege rutas privadas y muestra una página de bienvenida con la información de la sesión.

---

## Tabla de contenidos

- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo funciona](#cómo-funciona)
- [Prerrequisitos](#prerrequisitos)
- [Puesta en marcha (pnpm)](#puesta-en-marcha-pnpm)
- [Scripts disponibles](#scripts-disponibles)
- [Conexión con el backend](#conexión-con-el-backend)
- [Credenciales de demo](#credenciales-de-demo)
- [Solución de problemas](#solución-de-problemas)

---

## Stack

| Tecnología        | Versión | Uso                                    |
|-------------------|---------|----------------------------------------|
| React             | 18.3    | Librería de UI                         |
| TypeScript        | 5.4+    | Tipado estático                        |
| Vite              | 5.2+    | Dev server y bundler                   |
| React Router DOM  | 6.23    | Enrutado y rutas protegidas            |
| CSS Modules       | —       | Estilos con scope por componente       |
| pnpm              | 9+      | Gestor de paquetes                     |

---

## Estructura del proyecto

```
frontend/
├── index.html                 # HTML raíz (punto de montaje #root)
├── package.json               # Dependencias y scripts
├── pnpm-workspace.yaml        # Config de pnpm (builds permitidos)
├── pnpm-lock.yaml             # Lockfile de dependencias
├── tsconfig.json              # Config de TypeScript (app)
├── tsconfig.node.json         # Config de TypeScript (herramientas/Vite)
├── vite.config.ts             # Config de Vite + proxy a /auth
├── public/
│   └── favicon.svg            # Favicon
└── src/
    ├── main.tsx               # Bootstrap de React (createRoot)
    ├── App.tsx                # Definición de rutas
    ├── index.css              # Estilos globales / design tokens
    ├── vite-env.d.ts          # Tipos de Vite (incluye CSS Modules)
    ├── api/
    │   └── auth.ts            # Cliente fetch para /auth/token
    ├── context/
    │   └── AuthContext.tsx    # Estado global de sesión (login/logout)
    ├── components/
    │   └── ProtectedRoute.tsx # Guard de rutas autenticadas
    └── pages/
        ├── LoginPage.tsx      # Formulario de inicio de sesión
        ├── LoginPage.module.css
        ├── WelcomePage.tsx    # Página privada post-login
        └── WelcomePage.module.css
```

---

## Cómo funciona

```
┌────────────┐   /login    ┌──────────────┐   POST /auth/token   ┌──────────────┐
│  Usuario   │ ──────────► │  LoginPage    │ ───────────────────► │   Backend     │
│            │             │              │ ◄─────────────────── │  (FastAPI)    │
│            │             └──────┬───────┘   { access_token,    └──────────────┘
│            │                    │             refresh_token }
│            │            guarda sesión en
│            │            sessionStorage (AuthContext)
│            │                    │
│            │   /welcome  ┌──────▼────────┐
│            │ ◄─────────► │ ProtectedRoute │ ──► WelcomePage
└────────────┘             └───────────────┘
```

1. `AuthContext` mantiene la sesión (tokens + usuario) y la persiste en `sessionStorage`.
2. `LoginPage` envía las credenciales al backend mediante `api/auth.ts`.
3. Tras un login correcto se redirige a `/welcome`.
4. `ProtectedRoute` redirige a `/login` si no hay sesión activa.
5. `Cerrar sesión` limpia el almacenamiento y vuelve a `/login`.

---

## Prerrequisitos

- **Node.js** 18 o superior.
- **pnpm** 9 o superior (`npm install -g pnpm`).
- El **backend** corriendo en `http://localhost:8000` (ver [../backend/README.md](../backend/README.md)).

> En Windows con PowerShell, si `pnpm` está bloqueado por la política de ejecución de scripts, usa `pnpm.cmd` en lugar de `pnpm`.

---

## Puesta en marcha (pnpm)

```bash
# 1. Posiciónate en la carpeta del frontend
cd frontend

# 2. Instala las dependencias
pnpm install

# 3. Arranca el servidor de desarrollo
pnpm dev
```

La aplicación quedará disponible en **http://localhost:5173**.

> **Nota sobre `esbuild`:** Vite depende de `esbuild`, que necesita ejecutar un script de
> instalación para compilar su binario nativo. Este proyecto ya lo autoriza en
> `pnpm-workspace.yaml` (`onlyBuiltDependencies` / `allowBuilds`). Si tu instalación de pnpm
> muestra `ERR_PNPM_IGNORED_BUILDS`, ejecuta `pnpm approve-builds` y aprueba `esbuild`.

---

## Scripts disponibles

| Comando         | Descripción                                              |
|-----------------|----------------------------------------------------------|
| `pnpm dev`      | Inicia Vite en modo desarrollo con HMR (puerto 5173).    |
| `pnpm build`    | Compila TypeScript (`tsc`) y genera el bundle en `dist/`.|
| `pnpm preview`  | Sirve localmente el build de producción de `dist/`.      |

---

## Conexión con el backend

`vite.config.ts` define un proxy que redirige las peticiones a `/auth` hacia el backend:

```ts
server: {
  port: 5173,
  proxy: {
    '/auth': { target: 'http://localhost:8000', changeOrigin: true },
  },
}
```

Gracias a esto, el cliente (`src/api/auth.ts`) llama a `/auth/token` y la petición se reenvía a
`http://localhost:8000/auth/token` sin problemas de CORS durante el desarrollo.

Asegúrate de tener el backend levantado antes de iniciar sesión.

---

## Credenciales de demo

| Usuario | Contraseña |
|---------|------------|
| `admin` | `admin123` |

---

## Solución de problemas

| Problema                                            | Solución                                                                 |
|-----------------------------------------------------|--------------------------------------------------------------------------|
| `pnpm` no se reconoce o falla en PowerShell         | Usa `pnpm.cmd` o ajusta la política con `Set-ExecutionPolicy`.           |
| `ERR_PNPM_IGNORED_BUILDS` con `esbuild`             | Ejecuta `pnpm approve-builds` y aprueba `esbuild`, luego `pnpm install`. |
| Error de login / `Failed to fetch`                  | Verifica que el backend esté corriendo en `http://localhost:8000`.       |
| `Cannot find module './*.module.css'`               | Asegúrate de que exista `src/vite-env.d.ts` con `/// <reference types="vite/client" />`. |
| El puerto 5173 está ocupado                         | Cambia `server.port` en `vite.config.ts` o cierra el proceso que lo usa. |
