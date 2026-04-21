# 06 - 2FA Visual: Verificação de Identidade no Check-in

## Visão Geral

O sistema de portaria da A2 Tickets 360 implementa uma verificação de identidade visual em duas fases (2FA Visual) durante o check-in. Isso garante que o porteiro possa confirmar visualmente que a pessoa apresentando o QR Code é a mesma que comprou o ingresso.

## Regra de Negócio

> **Selfie obrigatória:** Na A2 Tickets 360, a selfie é um requisito inegociável para qualquer ingresso. O evento pode optar por ignorar a verificação visual na portaria, mas a plataforma sempre exige a captura no momento da compra.

## Fluxo de Animação (2 Fases)

### Fase 1 — Status (0 a 0.5s)
- Fundo **verde** com ícone de ✅
- Texto: **"LIBERADO!"**
- Subtexto: **"Check-in realizado com sucesso!"**
- O ícone e o texto ficam em destaque

### Fase 2 — Verificação Visual (0.5s em diante)
- O bloco de status **encolhe** suavemente (scale 75%, opacity 80%)
- A **selfie do comprador expande** automaticamente para ocupar ~70% da tela
- O nome do participante aparece em **fonte grande** abaixo da selfie
- O tipo de ingresso aparece abaixo do nome
- Badge de **"Verificado"** (ShieldCheck) cresce junto com a selfie
- Botão **"PRÓXIMO CLIENTE"** permanece fixo no rodapé

## Comportamento por Status

| Status | Cor | Ícone | Selfie Expand | Som |
|--------|-----|-------|---------------|-----|
| **Liberado** | Verde | ✅ CheckCircle | ✅ Auto-expand após 0.5s | Som de sucesso |
| **Já Entrou** | Âmbar | 🕐 Clock | ❌ Selfie pequena (estática) | Som neutro (sucesso) |
| **Negado** | Vermelho | ❌ XCircle | ❌ Sem selfie | 🚨 Sirene de alerta |

## Anti-Double-Scan

Para evitar que o scanner leia o mesmo QR Code duas vezes em milissegundos:

1. **Cooldown de 5 segundos** após cada leitura bem-sucedida
2. **Tracking do último QR lido** — mesmo QR é ignorado até clicar em "Próximo Cliente"
3. **Reset completo** ao clicar em "Próximo Cliente" (limpa cooldown + último QR)

## Componentes Envolvidos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/pages/staff/CheckInPage.tsx` | UI do validador com animação 2FA |
| `src/services/staffService.ts` | Lógica de validação online/offline |
| `src/lib/offline-db.ts` | IndexedDB para cache de ingressos |

## Considerações Técnicas

- As animações usam **CSS transitions** (duration-500 e duration-700) para fluidez
- O `max-h` com `overflow-hidden` cria o efeito de "reveal" da selfie
- A selfie expandida usa `aspect-[3/4]` para manter proporção de retrato
- O `max-h-[50vh]` garante que a selfie nunca ultrapasse metade da tela
- Todo o estado é limpo ao clicar em "Próximo Cliente" para garantir uma experiência limpa

## Histórico

- **2026-04-21**: Implementação inicial do 2FA Visual com auto-expand de selfie
