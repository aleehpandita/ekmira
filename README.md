# ekmira.com — página "Próximamente"

Sitio estático para Cloudflare Pages, con una lista de espera que guarda los correos en Cloudflare D1.

```
ekmira-site/
├── public/                 # lo que se publica
│   ├── index.html          # página principal (hero, piloto, módulos, Connect, Fundadores)
│   ├── privacidad.html     # aviso de privacidad simplificado (llenar los [CORCHETES])
│   ├── favicon.svg         # estrella de Ek'Mira
│   └── _headers            # cabeceras de seguridad
├── functions/api/waitlist.js   # POST /api/waitlist → inserta en D1
├── schema.sql              # tabla waitlist
└── wrangler.toml           # configuración de Pages + binding D1 "DB"
```

## Antes de publicar

1. En `public/privacidad.html`, reemplaza `[NOMBRE O RAZÓN SOCIAL DEL RESPONSABLE]`, `[DOMICILIO]` y `[FECHA DE PUBLICACIÓN]`. Conviene que lo revise tu abogado.
2. Crea los correos `contacto@ekmira.com` y `privacidad@ekmira.com`, o cambia esas direcciones en los dos HTML.

## Publicar (una sola vez)

1. **Pasa ekmira.com a Cloudflare.** Cloudflare → *Add a domain* → ekmira.com y, en tu registrador, cambia los nameservers por los que te da Cloudflare.
2. **Sube la carpeta a un repo de GitHub**, por ejemplo `ekmira-site` (privado está bien).
3. **Crea la base D1** y copia el `database_id` que imprime en `wrangler.toml`:
   ```bash
   npx wrangler login
   npx wrangler d1 create ekmira-waitlist
   npx wrangler d1 execute ekmira-waitlist --remote --file=schema.sql
   ```
4. **Crea el proyecto en Pages.** Cloudflare → *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → elige el repo.
   - Framework preset: *None*
   - Build command: vacío
   - Build output directory: `public`

   Pages toma el binding `DB` de `wrangler.toml`. Si no aparece, agrégalo en *Settings → Bindings → D1 database*, con nombre `DB` y base `ekmira-waitlist`.
5. **Dominio.** En el proyecto, *Custom domains* → agrega `ekmira.com` y `www.ekmira.com`.

Desde ahí, cada `git push` a `main` publica solo.

## Ver la lista de espera

```bash
npx wrangler d1 execute ekmira-waitlist --remote \
  --command "SELECT email, company, units, source, country, created_at FROM waitlist ORDER BY created_at DESC"
```

También puedes verla y exportarla desde el panel: *Storage & Databases → D1 → ekmira-waitlist*.

## Probar en tu computadora

```bash
npx wrangler d1 execute ekmira-waitlist --local --file=schema.sql
npx wrangler pages dev public
# abre http://localhost:8788
```

## Cómo responde la API

| Caso | Respuesta |
| --- | --- |
| Correo nuevo | `201 {"ok":true,"already":false}` |
| Correo ya registrado (sin importar mayúsculas) | `200 {"ok":true,"already":true}` |
| Correo inválido | `400 {"error":"..."}` |
| Bot (llenó el campo oculto `website`) | `200 {"ok":true}` y no se guarda nada |
