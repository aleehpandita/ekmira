# ekmira.com — página "Próximamente"

Sitio en Cloudflare Workers con archivos estáticos (`public/`) y una lista de espera que guarda los correos en Cloudflare D1.

```
ekmira-site/
├── public/                 # la página (index.html, privacidad.html, favicon.svg, _headers)
├── src/worker.js           # atiende /api/waitlist y sirve la página
├── src/waitlist.js         # validación e inserción en D1
├── schema.sql              # tabla waitlist
└── wrangler.toml           # Worker + assets + binding D1 "DB"
```

## Despliegue

El proyecto `ekmira` en *Workers y Pages* está conectado al repo de GitHub y despliega con `npx wrangler deploy` en cada push a `main`. No hay comando de compilación.

En `wrangler.toml`, `database_id` debe ser el ID de la base `ekmira-waitlist` (se obtiene con `npx wrangler d1 list`).

La tabla se crea una sola vez:

```bash
npx wrangler d1 execute ekmira-waitlist --remote --file=schema.sql
```

## Dominio

En el proyecto: *Dominios* (o *Configuración → Dominios y rutas*) → *Agregar* → *Dominio personalizado* → `ekmira.com`, y otra vez para `www.ekmira.com`.

## Ver la lista de espera

```bash
npx wrangler d1 execute ekmira-waitlist --remote \
  --command "SELECT email, company, units, source, country, created_at FROM waitlist ORDER BY created_at DESC"
```

## Probar en tu computadora

```bash
npx wrangler d1 execute ekmira-waitlist --local --file=schema.sql
npx wrangler dev
# abre http://localhost:8787
```

## Cómo responde la API

| Caso | Respuesta |
| --- | --- |
| Correo nuevo | `201 {"ok":true,"already":false}` |
| Correo ya registrado (sin importar mayúsculas) | `200 {"ok":true,"already":true}` |
| Correo inválido | `400 {"error":"..."}` |
| Bot (llenó el campo oculto `website`) | `200 {"ok":true}` y no se guarda nada |
| Método distinto de POST | `405` |
