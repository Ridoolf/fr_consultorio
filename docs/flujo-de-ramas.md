# Flujo de ramas (GitHub Flow)

Este proyecto usa **GitHub Flow**. La idea: `main` es lo que ve la clienta; el trabajo nuevo nunca se hace ahí.

## Concepto general

Una **rama** es una línea de trabajo paralela. El código de producción sigue intacto mientras vos experimentás en otra copia.

```
main          ●──●──●──────────────●   ← producción (Render + Netlify)
                 \                /
feature/xxx       ●──●──●── PR ──┘
```

## Ramas en este proyecto

| Rama | Para qué sirve |
|------|----------------|
| `main` | Producción. Solo entra código ya probado, vía Pull Request. |
| `feature/...` | Una mejora o funcionalidad. |
| `fix/...` | Un bug. |
| `chore/...` | Tareas de repo, docs, config. |

## Flujo de cada cambio

1. Arrancá siempre desde `main` actualizado:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nombre-corto
   ```
2. Codeá y probá en local (SQLite / tu `.env` de desarrollo).
3. Commit y push de **esa rama** (nunca de `main`):
   ```bash
   git push -u origin HEAD
   ```
4. Abrí un **Pull Request** hacia `main`.
5. Revisá el PR, mergeá, y recién ahí Render/Netlify despliegan.

## Reglas

- No pushear a `main`. GitHub lo bloquea.
- Un tema por rama (no mezclar odontograma + caja + docs).
- Después del merge, borrar la rama. El próximo cambio sale de un `main` fresco.
