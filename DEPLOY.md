# Guía de deploy — Consultorio

## Variables de entorno en Render (backend)

| Variable | Ejemplo | Requerida |
|----------|---------|-----------|
| `SECRET_KEY` | (generar string aleatorio largo) | Sí |
| `DEBUG` | `False` | Sí |
| `ALLOWED_HOSTS` | `fr-consultorio-backend.onrender.com` | Sí |
| `DATABASE_URL` | (auto desde Postgres de Render) | Sí |
| `CORS_ALLOWED_ORIGINS` | `https://fr-consultorio.netlify.app` | Sí |
| `TIME_ZONE` | `America/Argentina/Buenos_Aires` | Sí |
| `CONSULTORIO_USER` | `consultorio` | Sí (primer deploy) |
| `CONSULTORIO_PASSWORD` | (contraseña segura) | Sí (primer deploy) |
| `CLOUDINARY_CLOUD_NAME` | (desde dashboard Cloudinary) | Sí |
| `CLOUDINARY_API_KEY` | | Sí |
| `CLOUDINARY_API_SECRET` | | Sí |

### Comandos Render

**Build:**
```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python manage.py create_consultorio_user
```

**Start:**
```bash
gunicorn config.wsgi:application
```

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

```bash
# Backend
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
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
