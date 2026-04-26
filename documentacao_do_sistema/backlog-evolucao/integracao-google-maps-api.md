# 🗺️ Integração Real Google Maps API

## Status: 🔴 Pendente (Aguardando Credenciais)

## Objetivo
Substituir o placeholder `REPLACE_WITH_VALID_KEY` na `EventDetailPage.tsx` por uma API Key real do Google Cloud Platform para habilitar o carregamento dos mapas interativos.

## Detalhes Técnicos
- **Arquivo**: `src/pages/EventDetailPage.tsx`
- **Variável Sugerida**: `VITE_GOOGLE_MAPS_KEY`
- **Uso**: Injeção no `iframe` de embed do Google Maps.

## Critérios de Aceite
- [ ] Criar chave de API no Google Cloud Console com restrição de domínio (HTTP Referrer).
- [ ] Ativar as APIs: **Maps Embed API** e **Maps Static API**.
- [ ] Configurar a variável no `.env` de produção.
- [ ] Validar o carregamento do mapa na página de detalhes do evento.
