import { createClient } from '@supabase/supabase-js';

// Inicializa Supabase com variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default async function handler(req: any, res: any) {
    let slug = req.query.slug as string;

    if (!slug && req.url) {
        const match = req.url.match(/\/evento\/([^/?]+)/);
        if (match) slug = match[1];
    }

    if (!slug || typeof slug !== 'string') {
        return serveFallback(req, res);
    }

    try {
        // Buscar dados do evento
        const { data: event, error } = await supabase
            .from('events')
            .select('title, banner_url, start_date, location_name, city, state')
            .eq('slug', slug)
            .single();

        if (error || !event) {
            console.error('Evento não encontrado para o slug:', slug);
            return serveFallback(req, res);
        }

        // Obter HTML base do próprio host
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        const baseUrl = `${proto}://${host}`;
        
        const htmlRes = await fetch(`${baseUrl}/index.html`);
        if (!htmlRes.ok) {
            throw new Error(`Failed to fetch index.html: ${htmlRes.status}`);
        }
        let html = await htmlRes.text();

        // Construir Metadata
        const title = escapeHtml(event.title) + ' | A2 Tickets 360º';
        const ogTitle = escapeHtml(event.title);
        
        let dateStr = '';
        if (event.start_date) {
            try {
                const d = new Date(event.start_date);
                dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                // ignore
            }
        }

        const locParts = [dateStr, event.city && event.state ? `${event.city}/${event.state}` : event.location_name, 'A2 Tickets 360º'].filter(Boolean);
        const description = escapeHtml(locParts.join(' • '));

        const image = escapeHtml(event.banner_url || `${baseUrl}/logo_512x512.png`);
        const url = escapeHtml(`${baseUrl}/evento/${slug}`);

        // Substituir as tags padrão
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        
        html = html.replace(/<meta name="description" content=".*?"[^>]*>/, `<meta name="description" content="${description}" />`);
        html = html.replace(/<meta property="og:title" content=".*?"[^>]*>/, `<meta property="og:title" content="${ogTitle}" />`);
        html = html.replace(/<meta property="og:description" content=".*?"[^>]*>/, `<meta property="og:description" content="${description}" />`);
        html = html.replace(/<meta property="og:image" content=".*?"[^>]*>/, `<meta property="og:image" content="${image}" />`);
        html = html.replace(/<meta property="og:url" content=".*?"[^>]*>/, `<meta property="og:url" content="${url}" />`);
        
        html = html.replace(/<meta name="twitter:title" content=".*?"[^>]*>/, `<meta name="twitter:title" content="${ogTitle}" />`);
        html = html.replace(/<meta name="twitter:description" content=".*?"[^>]*>/, `<meta name="twitter:description" content="${description}" />`);
        html = html.replace(/<meta name="twitter:image" content=".*?"[^>]*>/, `<meta name="twitter:image" content="${image}" />`);

        // Inserir Canonical antes de fechar o head
        html = html.replace('</head>', `  <link rel="canonical" href="${url}" />\n</head>`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        return res.send(html);

    } catch (err) {
        console.error('Erro ao gerar OG Dinâmico:', err);
        return serveFallback(req, res);
    }
}

async function serveFallback(req: any, res: any) {
    try {
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        const baseUrl = `${proto}://${host}`;
        const htmlRes = await fetch(`${baseUrl}/index.html`);
        const html = await htmlRes.text();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch (e) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`<!DOCTYPE html><html><head><title>A2 Tickets 360º</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
    }
}
