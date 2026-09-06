# Guía de deploy — Consultorio

## Arquitectura en producción

| Componente | Servicio | Notas |
|------------|----------|-------|
| **Frontend** | Netlify | React/Vite estático |
| **Backend (API)** | Render | Django + Gunicorn |
| **Base de datos** | **Neon** | PostgreSQL serverless |

Render **solo ejecuta el backend**. Los datos viven en **Neon**. La variable `DATABASE_URL` en Render debe apuntar a la connection string de Neon (no a Postgres de Render).

Ejemplo de `DATABASE_URL`:

```text
postgresql://usuario:password@ep-xxx.neon.tech/neondb?sslmode=require
```

## Variables de entorno en Render (backend)

| Variable | Ejemplo | Requerida |
|----------|---------|-----------|
| `SECRET_KEY` | (generar string aleatorio largo) | Sí |
| `DEBUG` | `False` | Sí |
| `ALLOWED_HOSTS` | `fr-consultorio-backend.onrender.com` | Sí |
| `DATABASE_URL` | Connection string de **Neon** (`?sslmode=require`) | Sí |
| `CORS_ALLOWED_ORIGINS` | `https://fr-consultorio.netlify.app` | Sí |
| `TIME_ZONE` | `America/Argentina/Buenos_Aires` | Sí |
| `CONSULTORIO_USER` | `consultorio` | Sí (primer deploy) |
| `CONSULTORIO_PASSWORD` | (contraseña segura) | Sí (primer deploy) |
| `CLOUDINARY_CLOUD_NAME` | (desde dashboard Cloudinary) | Sí |
| `CLOUDINARY_API_KEY` | | Sí |
| `CLOUDINARY_API_SECRET` | | Sí |

### Comandos Render

**Build** (cada deploy):
```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
```

**Start:**
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**Health Check Path** (opcional, en Settings del servicio web):
```
/api/health/
```

**Primer deploy o reset de contraseña** (una sola vez, desde Shell de Render):
```bash
python manage.py create_consultorio_user
```

Para cambiar la contraseña de un usuario que ya existe:
```bash
python manage.py create_consultorio_user --reset-password
```

## Base de datos (Neon)

- Crear proyecto en [Neon](https://console.neon.tech).
- Copiar la connection string y pegarla en `DATABASE_URL` del servicio web en Render.
- Las migraciones se aplican en el **build de Render** (`python manage.py migrate`).
- **No** hace falta Postgres en Render si ya usás Neon; podés eliminar la instancia de Postgres de Render una vez verificado que la app funciona con Neon.

## Variables en Netlify (frontend)

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://fr-consultorio-backend.onrender.com/api` |

## Checklist post-deploy (datos existentes)

1. Login con usuario `CONSULTORIO_USER` / contraseña configurada
2. Listar pacientes — deben aparecer los ya cargados (mismos IDs/DNI)
3. Editar y guardar un paciente existente
4. Crear turno — fecha correcta en horario Argentina
5. Subir documento — URL Cloudinary accesible
6. Registrar pago — totales validados
7. Probar en tablet (768×1024) o iPad en DevTools

## Desarrollo local

En local la base de datos es **SQLite** (`backend/db.sqlite3`), independiente de Neon.

```bash
# Backend
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
set USE_LOCAL_DB=true
set CONSULTORIO_USER=consultorio
set CONSULTORIO_PASSWORD=tu_password_local
python manage.py migrate
python manage.py create_consultorio_user
python manage.py runserver

# Frontend (otra terminal)
cd frontend
npm install
# Crear .env con VITE_API_URL=/api
npm run dev
```

Login local: usuario y contraseña definidos en `CONSULTORIO_USER` / `CONSULTORIO_PASSWORD`.
