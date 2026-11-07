// POST /api/waitlist — guarda un registro de la lista de espera en D1.
// Binding requerido: DB (base D1 "ekmira-waitlist"; tabla en schema.sql).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UNITS = new Set(['', '1 a 5', '6 a 20', '21 a 50', 'Más de 50']);
const SOURCES = new Set(['hero', 'fundadores']);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'El servicio no está configurado todavía.' }, 500);

  const type = request.headers.get('Content-Type') || '';
  if (!type.includes('application/json')) return json({ error: 'Formato no válido.' }, 415);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Formato no válido.' }, 400);
  }

  // Trampa para bots: el campo "website" está oculto para personas.
  if (clean(data.website, 200)) return json({ ok: true });

  const email = clean(data.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: 'Revisa tu correo, parece que le falta algo.' }, 400);

  const company = clean(data.company, 120);
  const units = UNITS.has(clean(data.units, 20)) ? clean(data.units, 20) : '';
  const source = SOURCES.has(clean(data.source, 20)) ? clean(data.source, 20) : 'hero';
  const country = request.cf?.country || '';
  const userAgent = clean(request.headers.get('User-Agent') || '', 300);

  try {
    const result = await env.DB.prepare(
      `INSERT INTO waitlist (email, company, units, source, country, user_agent)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)
       ON CONFLICT(email) DO NOTHING`
    )
      .bind(email, company, units, source, country, userAgent)
      .run();

    const already = (result.meta?.changes ?? 0) === 0;
    return json({ ok: true, already }, already ? 200 : 201);
  } catch (err) {
    console.error('waitlist insert failed', err);
    return json({ error: 'No pudimos guardar tu correo. Intenta de nuevo.' }, 500);
  }
}
