# 🎞️ Automação de Banners Patrocinados

## Status: ⏳ Backlog

## Objetivo
Automatizar o ciclo de vida dos banners patrocinados vinculando-os a eventos específicos, garantindo que saiam da Hero carousel 30 minutos após o término oficial do evento.

## Regras de Negócio
- **Vínculo**: No modal de criação, o Admin seleciona um evento da lista.
- **Trigger de Saída**: O sistema calcula `expires_at = event.end_date + 30 minutes`.
- **Visibilidade**: O banner deixa de ser retornado na consulta da Home após o `expires_at`.

## Requisitos Técnicos
- [ ] Seletor de Eventos no Modal de Banner.
- [ ] Campo `event_id` na tabela `hero_banners`.
- [ ] Job de limpeza ou filtro reativo no `cmsService`.
