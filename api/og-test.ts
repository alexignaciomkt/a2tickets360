export default function handler(req: any, res: any) {
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    const host = req.headers?.['host'] || 'www.a2tickets360.com.br';
    const baseUrl = `${proto}://${host}`;

    const title = 'FAS - Feira da Arte e do Samba - 100 anos do Bambas';
    const description = '07/11/2026 • Ribeirão Preto/SP • A2 Tickets 360º';
    const image = `${baseUrl}/og-tests/fas-social-test.jpg`;
    const url = `${baseUrl}/og-test/fas-20260925`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="noindex,nofollow" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="A2 Tickets 360º" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:url" content="${url}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <link rel="canonical" href="${url}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p><img src="${image}" alt="${title}" style="max-width:100%" /></p>
  <p><small>Página de teste OG - não indexar</small></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.send(html);
}
