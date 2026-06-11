# Guía de estudio: fr_consultorio

## Capítulo 1 — El entorno: qué es todo esto y cómo encaja

> **Para quién es esta guía:** alguien que sabe programar lo básico (variables, funciones, condicionales) pero nunca trabajó con backend web.
>
> **Cómo leerla:** cada sección explica primero el **concepto general** (aplicable a cualquier proyecto) y después muestra **cómo se ve en este proyecto**.

---

## 1.1 La metáfora de la función `suma()` vs "qué es una función"

Tu problema es muy común y muy importante de resolver.

Imaginá que aprendés a cocinar haciendo **una sola receta**: tortilla de papas. Sabés pelar papas, freírlas, mezclar con huevo. Un día alguien te dice "hice **milanesas**" y te perdés, porque aprendiste **una receta**, no **cocinar**.

En programación pasa lo mismo:

| Aprendiste la receta específica | Deberías aprender la técnica general |
|--------------------------------|-------------------------------------|
| `suma(a, b)` en JavaScript | **Función**: bloque reutilizable con entrada → proceso → salida |
| `PacienteSerializer` en Django | **Serializer**: traductor entre "objeto del mundo real" y "JSON" |
| `GET /api/pacientes/` | **Endpoint REST**: una "puerta" del servidor con una acción concreta |
| `PacienteViewSet` | **ViewSet / Controller**: capa que recibe pedidos HTTP y coordina la respuesta |

**Regla de oro para leer cualquier proyecto nuevo:**

1. **No preguntés** "¿qué hace `PacienteViewSet`?" primero.
2. **Preguntá** "¿qué **rol** cumple esta pieza en la arquitectura?"
3. Después mirá los nombres concretos (`Paciente`, `Turno`, etc.) como **ejemplos** de ese rol.

En los próximos capítulos vas a ver siempre este esquema:

```
CONCEPTO GENERAL  →  CÓMO SE LLAMA EN DJANGO/DRF  →  ARCHIVO EN ESTE PROYECTO
```

---

## 1.2 Qué es una aplicación web (visión de pájaro)

Una **aplicación web** es un sistema donde:

1. El **usuario** interactúa desde un navegador (Chrome, Safari, etc.).
2. Hay un **servidor** en internet (o en tu PC) que procesa pedidos.
3. Hay **datos** que persisten (pacientes, turnos, usuarios…).

### Metáfora: restaurante

| Parte del restaurante | En software | En fr_consultorio |
|----------------------|-------------|-------------------|
| El comedor, menú, mesas | **Frontend** (lo que ves) | Carpeta `frontend/` (React) |
| La cocina, recetas, reglas | **Backend** (lógica + datos) | Carpeta `backend/` (Django) |
| La despensa / inventario | **Base de datos** | PostgreSQL (en producción) |
| El mozo que lleva pedidos | **API REST** (HTTP + JSON) | Rutas bajo `/api/` |
| El guardia en la puerta | **Autenticación** | JWT (tokens) |

El cliente **no entra a la cocina**. Pide al mozo. El mozo lleva el pedido, la cocina prepara, y el mozo trae la respuesta.

Eso es **separar frontend y backend**: dos programas distintos que hablan por un protocolo acordado (HTTP + JSON).

---

## 1.3 Frontend vs Backend vs Base de datos

### Frontend (cliente)

**Concepto:** todo lo que corre **en el navegador del usuario**. HTML, CSS, JavaScript. Muestra pantallas, botones, formularios. **No debería** guardar secretos ni ser la única fuente de verdad de los datos.

**Genérico:** React, Vue, Angular, Svelte, o incluso HTML plano.

**En este proyecto:**

- Tecnología: **React** + **Vite**
- Vive en: `frontend/src/`
- Se despliega en: Netlify (archivos estáticos)
- Puerto local típico: `http://localhost:5173`

### Backend (servidor)

**Concepto:** programa que **siempre está corriendo** en un servidor. Recibe pedidos, aplica reglas de negocio ("un turno no puede solaparse", "solo usuarios logueados"), lee/escribe la base de datos, devuelve respuestas.

**Genérico:** Django, Flask, FastAPI, Express (Node), Spring (Java), Laravel (PHP)…

**En este proyecto:**

- Tecnología: **Django** + **Django REST Framework (DRF)**
- Vive en: `backend/`
- Se despliega en: Render
- URL de producción: `https://fr-consultorio-backend.onrender.com/api/`

### Base de datos

**Concepto:** almacén **estructurado** y **persistente**. Si apagás el servidor, los datos siguen ahí. Usualmente hablás con ella mediante un ORM (Object-Relational Mapping): escribís clases/objetos y el framework traduce a SQL.

**Genérico:** PostgreSQL, MySQL, SQLite, MongoDB…

**En este proyecto:**

- PostgreSQL en producción (via `DATABASE_URL`)
- SQLite posible en desarrollo local
- Los "planos" de las tablas están en `backend/*/models.py`

---

## 1.4 SPA: Single Page Application

### Concepto general

Antes, cada clic en una web **recargaba toda la página** desde el servidor (HTML nuevo cada vez).

Una **SPA** carga **una sola vez** un "cascarón" de JavaScript y después **cambia las pantallas sin recargar** todo. El navegador pide **datos** (JSON) al backend, no páginas HTML completas.

**Analogía:** en vez de ir a una biblioteca y traerte un libro entero cada vez (HTML clásico), tenés una **app de lectura** que ya está instalada y solo descarga el **capítulo** que necesitás (JSON).

### En este proyecto

`frontend/src/App.jsx` define **rutas del lado del cliente**:

- `/pacientes` → lista de pacientes
- `/turnos` → agenda
- `/login` → login

React Router decide qué componente mostrar **sin** que Django renderice HTML por vos.

**Importante:** "SPA" describe al **frontend**. El backend **no sabe** qué pantalla estás viendo; solo responde a URLs como `/api/pacientes/`.

---

## 1.5 API REST: el "idioma" entre frontend y backend

### Concepto general

**API** = Application Programming Interface = conjunto de **reglas y puertas** para que un programa hable con otro.

**REST** = estilo muy popular de diseñar APIs web usando **HTTP** y **recursos** (cosas: usuarios, productos, pacientes…).

Cada recurso suele tener una URL base y acciones estándar:

| Querés… | Método HTTP | URL genérica | Ejemplo en este proyecto |
|---------|-------------|--------------|--------------------------|
| Listar todos | `GET` | `/recursos/` | `GET /api/pacientes/` |
| Ver uno | `GET` | `/recursos/5/` | `GET /api/pacientes/5/` |
| Crear | `POST` | `/recursos/` | `POST /api/pacientes/` |
| Reemplazar | `PUT` | `/recursos/5/` | `PUT /api/pacientes/5/` |
| Modificar parte | `PATCH` | `/recursos/5/` | `PATCH /api/pacientes/5/` |
| Borrar | `DELETE` | `/recursos/5/` | `DELETE /api/pacientes-documentos/3/` |

Los datos viajan casi siempre en **JSON** (texto estructurado):

```json
{
  "id": 1,
  "nombre": "Ana",
  "apellido": "García",
  "dni": "12345678"
}
```

**Analogía del correo:**

- **URL** = dirección del destinatario
- **Método HTTP** = tipo de sobre (consulta, envío, modificación, baja)
- **Headers** = sobre exterior (ej. "soy el usuario X", `Authorization: Bearer ...`)
- **Body** = contenido del sobre (el JSON)

### Cómo lo usa la SPA

El frontend centraliza las llamadas en `frontend/src/services/api.js`:

```javascript
// Concepto: "cliente HTTP" — un módulo que sabe hablar con la API
pacientesAPI.getAll()     // GET /api/pacientes/
pacientesAPI.create(data) // POST /api/pacientes/
```

Cualquier proyecto SPA + REST tendrá algo equivalente: `api.js`, `services/`, `hooks/useFetch`, etc. **El nombre cambia; el rol no.**

---

## 1.6 Las capas del backend (patrón que verás en casi todos lados)

Cuando leas **cualquier** backend bien organizado, vas a encontrar capas similares:

```
Pedido HTTP
    ↓
[ URLs / Routing ]      ← "¿a qué dirección llegó el pedido?"
    ↓
[ Views / Controllers ] ← "¿qué hacemos con este pedido?"
    ↓
[ Serializers / DTOs ]  ← "¿cómo traducimos JSON ↔ objetos?"
    ↓
[ Models / Entities ]   ← "¿cómo representamos los datos en código?"
    ↓
[ Base de datos ]
```

| Capa | Rol genérico | En Django/DRF | Carpeta en este proyecto |
|------|--------------|---------------|--------------------------|
| Routing | Mapa de URLs | `urls.py` + Router | `backend/config/urls.py`, `backend/*/urls.py` |
| Vista | Lógica del endpoint | `ViewSet`, `APIView` | `backend/*/views.py` |
| Serializer | Traducción JSON | `Serializer` | `backend/*/serializers.py` |
| Modelo | Estructura de datos | `Model` | `backend/*/models.py` |
| Config | Ajustes globales | `settings.py` | `backend/config/settings.py` |

**No te obsesiones con los nombres de Django.** En Express (Node) dirías `routes` + `controllers` + `schemas`. En Spring, `Controller` + `Entity` + `Repository`. **Es la misma arquitectura en capas con distinto vocabulario.**

---

## 1.7 Cómo está organizado ESTE proyecto (mapa de carpetas)

```
fr_consultorio/
├── frontend/          ← SPA (React)
│   └── src/
│       ├── pages/     ← Pantallas (PacientesList, TurnosPage…)
│       ├── components/← Piezas reutilizables de UI
│       ├── services/  ← Cliente API (api.js)
│       └── context/   ← Estado global (auth, toasts)
│
└── backend/           ← API REST (Django)
    ├── config/        ← Configuración del proyecto ("cerebro central")
    │   ├── settings.py
    │   ├── urls.py
    │   └── auth_views.py
    ├── pacientes/     ← App Django: dominio "pacientes"
    ├── turnos/        ← App Django: dominio "turnos"
    └── caja/          ← App Django: pagos y tratamientos
```

### Qué es una "app" en Django (concepto transferible)

Django divide el backend en **apps** por **dominio de negocio**, no por capa técnica.

- `pacientes` → todo lo de pacientes y documentos
- `turnos` → agenda
- `caja` → pagos y tipos de tratamiento

**En otro proyecto** podrías tener `users`, `orders`, `inventory`. **El patrón es:** una carpeta = un área del negocio, con sus `models`, `views`, `serializers` adentro.

Dentro de cada app, la estructura se repite:

```
pacientes/
├── models.py       ← qué datos existen
├── serializers.py  ← cómo se convierten a JSON
├── views.py        ← qué endpoints hay
├── urls.py         ← rutas de esa app
├── admin.py        ← panel admin de Django (opcional)
└── migrations/     ← historial de cambios en la DB
```

Cuando veas `turnos/views.py`, no pensés "archivo raro de turnos". Pensá: **"capa de endpoints del dominio turnos"** — igual que `pacientes/views.py` pero con otra entidad.

---

## 1.8 Stack tecnológico (herramientas concretas vs roles)

| Rol | Herramienta en este proyecto | Equivalentes que podés ver después |
|-----|------------------------------|----------------------------------|
| UI | React 19 | Vue, Angular, Svelte |
| Bundler / dev server | Vite | Webpack, Parcel |
| HTTP cliente | Axios | fetch nativo, ky |
| Routing frontend | React Router | Vue Router, Next.js routing |
| Framework backend | Django 6 | Flask, FastAPI, NestJS |
| API sobre Django | DRF | FastAPI nativo, Nest controllers |
| Auth | JWT (SimpleJWT) | OAuth, sessions, Auth0, Clerk |
| CORS | django-cors-headers | middleware en cualquier framework |
| DB driver | psycopg2 (PostgreSQL) | mysqlclient, sqlite3 |
| Servidor prod | Gunicorn | uWSGI, uvicorn |
| Archivos en la nube | Cloudinary | S3, Azure Blob |

**requirements.txt** (backend) y **package.json** (frontend) son las "listas de compras" de librerías. En cualquier repo, esos archivos te dicen **con qué está hecho**.

---

## 1.9 Un pedido completo: de clic a base de datos

Supongamos que en el celular (o PC) abrís la lista de pacientes.

```
1. Usuario abre /pacientes en el navegador
   → React muestra PacientesList.jsx

2. PacientesList llama pacientesAPI.getAll()
   → Axios hace GET https://.../api/pacientes/
   → Header: Authorization: Bearer eyJhbG...

3. Django recibe el pedido en config/urls.py
   → Lo deriva a pacientes/urls.py → PacienteViewSet

4. DRF verifica el token JWT (¿está logueado?)
   → Si no: 401 Unauthorized

5. PacienteViewSet.list() consulta la DB vía Paciente.objects...
   → PacienteSerializer convierte cada fila a JSON

6. Respuesta HTTP 200 + JSON array
   → React guarda en state y pinta la tabla
```

**Diagrama:**

```
[Navegador / React]  --HTTP+JSON-->  [Django + DRF]  --ORM-->  [PostgreSQL]
       ↑                                    |
       └──────────── JSON response ─────────┘
```

Este flujo es **universal**. Cambiá Django por FastAPI y React por Vue: la forma del diagrama **sigue igual**.

---

## 1.10 Desarrollo local vs producción

| | Desarrollo (tu PC) | Producción (internet) |
|--|-------------------|------------------------|
| Frontend | `npm run dev` → :5173 | Netlify sirve `dist/` |
| Backend | `python manage.py runserver` → :8000 | Render + Gunicorn |
| DB | SQLite o Postgres local | Postgres en Render |
| DEBUG | `True` (más info de errores) | `False` |
| CORS | permite localhost:5173 | permite dominio Netlify |

**Concepto:** el **mismo código** corre en entornos distintos con **variables de entorno** distintas (`DATABASE_URL`, `SECRET_KEY`, `VITE_API_URL`). Eso también es patrón universal.

---

## 1.11 Qué NO es este proyecto (para no confundirte)

- **No es** una web Django clásica con templates HTML del servidor. Django acá **solo API**.
- **No es** un monolito donde frontend y backend están pegados en un solo deploy (hay **dos** deploys).
- **No usa** paginación DRF (devuelve listas completas). Otros proyectos sí; no asumas que todos son iguales.
- **El admin de Django** (`/admin/`) existe pero la SPA **no lo usa**; es panel aparte para administración.

---

## 1.12 Glosario mínimo del Capítulo 1

| Término | Una frase |
|---------|-----------|
| **Frontend** | Lo que corre en el navegador |
| **Backend** | Servidor que procesa lógica y datos |
| **API** | Interfaz para que programas se hablen |
| **REST** | Estilo de API con URLs + métodos HTTP |
| **JSON** | Formato de texto para intercambiar datos |
| **SPA** | Web que no recarga entera en cada pantalla |
| **Endpoint** | URL + método con una acción concreta |
| **ORM** | Escribir DB como objetos, no SQL a mano |
| **JWT** | Token que prueba quién sos sin session cookies |
| **CORS** | Reglas de qué dominios pueden llamar a la API |

---

## 1.13 Plan de capítulos (lo que viene)

| Cap. | Tema | Concepto transferible |
|------|------|------------------------|
| **1** ✅ | El entorno | Frontend/backend/API/SPA |
| **2** | Django y las apps | MVC, apps por dominio, settings |
| **3** | Modelos y ORM | Entidades, relaciones, migraciones |
| **4** | Serializers (DRF) | DTOs, validación, traducción JSON |
| **5** | Views y ViewSets | Controllers, CRUD automático, `@action` |
| **6** | URLs y routing | Routers, namespaces |
| **7** | Auth y permisos | JWT, middleware, guards |
| **8** | Frontend React | Componentes, state, routing |
| **9** | api.js y flujo SPA | Cliente HTTP, interceptors |
| **10** | Deploy y env vars | CI/CD mental model |

---

## 1.14 Ejercicio mental (para fijar conceptos)

Antes del Capítulo 2, respondé sin mirar código:

1. Si mañana te muestran un proyecto **FastAPI + Vue**, ¿dónde buscarías el equivalente a `api.js`?
2. ¿Qué diferencia hay entre `/pacientes` (frontend) y `/api/pacientes/` (backend)?
3. Si borrás `frontend/` entero, ¿el backend sigue funcionando? ¿y al revés?
4. Un `PacienteViewSet` es como una función `suma()` o como el **concepto de función**?

**Respuestas orientativas:**

1. Carpeta `services/`, `api/`, `composables/`, o similar.
2. La primera es ruta de **pantalla** (React); la segunda es **recurso de datos** (API).
3. Backend sí (con Postman/curl); frontend carga pero **no tiene datos** sin API.
4. Es una **implementación concreta** del concepto "controlador de recurso REST".
