# Homologação Financeira Asaas

BUG-HOM-001 — organizer lookup — CORRIGIDO
BUG-HOM-FIN-001 — taxa A2 — CORRIGIDO
BUG-HOM-FIN-002 — comissão paralela — CORRIGIDO
BUG-HOM-FIN-003 — discount hardcoded — CORRIGIDO
BUG-HOM-004 — sanitização description — CORRIGIDO
BUG-HOM-005 — EventParticipants sobrevivem a checkout falho — PENDENTE
BUG-HOM-FIN-004 — settlement manual promoter retido pela A2 — PENDENTE
BUG-HOM-006 — Credencial/QR antes da confirmação financeira — HOMOLOGADO EM PRODUÇÃO
BUG-HOM-007 — Painel produtor replica comprador em vez dos participantes — HOMOLOGADO EM PRODUÇÃO
BUG-HOM-008 — Policy de leitura de sales do organizador compara events.organizer_id diretamente com auth.uid() — IDENTIFICADO — NÃO IMPLEMENTADO

ENH-HOM-009 — Promoter — Visibilidade de compras pendentes atribuídas — IMPLEMENTADO LOCALMENTE — AGUARDANDO DEPLOY/HOMOLOGAÇÃO
**Semântica:**
`pending`: aparece na carteira comercial do promoter; não é compra concluída; não é receita realizada; não gera comissão realizada; não representa credencial válida.
`paid`: compra concluída; entra na receita; segue regras financeiras/promoter existentes.

**Causa do BUG-HOM-007:** Policy RLS comparava `events.organizer_id` com `auth.uid()`, misturando identidade de domínio do organizador com `auth.users.id`.

- API VPS → Vercel: PASS
- webhook auth Sandbox: PASS
- primeira cobrança Sandbox válida: criada
- split técnico Asaas: funcionando
- distribuição promoter manual: regra atual incorreta e pendente de correção

NÃO marcar homologação financeira como concluída.
