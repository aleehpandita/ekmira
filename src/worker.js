// Worker de ekmira.com: atiende la API de la lista de espera
// y deja que Cloudflare sirva la página estática de /public.
import { handleWaitlist, json } from './waitlist.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/waitlist') {
      if (request.method === 'POST') return handleWaitlist(request, env);
      return json({ error: 'Método no permitido.' }, 405, { Allow: 'POST' });
    }

    return env.ASSETS.fetch(request);
  },
};
