# Technical Briefing — A2 Tickets 360

**Version:** 1.0
**Date:** 2026-03-26
**Status:** Approved for Development

---

## 1. Context and Problem

**Current situation:**
Produtores de eventos brasileiros operam com ferramentas fragmentadas: Sympla/Eventbrite para bilhetagem, planilhas para controle financeiro, WhatsApp para gestão de equipe, e ferramentas externas de marketing (Meta Ads, Google Ads) sem integração entre si. Não possuem dados de audiência próprios e dependem das plataformas de terceiros para acessar informações dos seus próprios compradores.

**Problem:**
A fragmentação gera perda de dados de audiência, ineficiência operacional, impossibilidade de medir ROI de marketing por canal, e ausência de controle financeiro em tempo real. O produtor não tem "propriedade" do seu público.

**Impact of not solving:**
Produtores continuam reféns de plataformas genéricas, pagando taxas elevadas sem obter inteligência de negócio. Perda de oportunidade de construir audiência própria e reduzir custo de aquisição entre edições.

---

## 2. Objective (SMART)

Lançar a A2 Tickets 360 como plataforma SaaS de bilhetagem focada no produtor, atingindo as Fases 1 e 2 do roadmap com:
- Publicação de eventos, checkout completo e CRM básico (Fase 1)
- Ticketing completo, checkout com biometria, app de check-in QR Code e dashboards financeiros (Fase 2)

Métrica de sucesso: primeiros 50 organizadores ativos publicando eventos com ingressos vendidos via Asaas.

---

## 3. Target Audience / Personas

### Persona 1: Produtor Iniciante
- **Context:** Organiza 1-3 eventos por ano, sem equipe técnica. Usa Sympla pelo baixo custo de entrada.
- **JTBD:** Quando preciso lançar meu evento, quero criar uma página profissional em minutos, para não perder credibilidade com meu público.
- **Pain points:** Interface confusa em concorrentes, sem controle sobre dados dos compradores, taxa de 10%+ sem retorno em dados.

### Persona 2: Produtor em Crescimento
- **Context:** 5-20 eventos/ano, tem equipe pequena. Gasta R$5k-50k/mês em mídia paga sem saber o ROI real por canal.
- **JTBD:** Quando invisto em anúncios, quero ver qual canal está gerando ingressos vendidos, para realocar verba com precisão.
- **Pain points:** Dados de marketing e vendas em sistemas separados, gestão de staff via WhatsApp, sem projeção de público.

### Persona 3: Agência / Grande Produtor
- **Context:** 20+ eventos/ano, múltiplas equipes, patrocinadores exigem relatórios customizados.
- **JTBD:** Quando apresento resultados a patrocinadores, quero relatórios white-label com dados reais, para fechar novos contratos de patrocínio.
- **Pain points:** Nenhuma plataforma atual oferece white-label + BI integrado + gestão multi-equipe.

### Persona 4: Comprador de Ingresso
- **Context:** Compra 5-20 ingressos/ano em eventos variados.
- **JTBD:** Quando compro um ingresso, quero ter confiança de que não serei vítima de fraude e acessar meu QR Code facilmente no dia do evento.
- **Pain points:** Medo de fraude (ingresso clonado), dificuldade de acessar ingresso digital sem internet no local.

### Persona 5: Staff / Colaborador
- **Context:** Trabalha em eventos como operador, supervisor ou técnico.
- **JTBD:** Quando procuro trabalho em eventos, quero ver vagas disponíveis e gerenciar minha agenda e pagamentos em um único lugar.
- **Pain points:** Oportunidades chegam por indicação informal, sem controle de pagamentos recebidos.

---

## 4. Scope

### In Scope (Fases 1 + 2)

**Área Pública:**
- Página Inicial com carrossel e vitrine de eventos
- Listagem e busca de eventos
- Página de detalhes do evento
- Checkout 3 etapas (dados + foto biométrica + Asaas PIX/Cartão)
- Login, Registro de Comprador, Registro de Organizador
- Página /para-produtores, /work-with-us
- Fan Page da Produtora (/producer/:slug)
- Validador de ingressos (/validador)

**Painel do Comprador:**
- Dashboard com ingressos ativos
- Listagem de ingressos com QR Code individual
- Configurações de conta

**Painel do Organizador (20+ telas):**
- Dashboard com estatísticas gerais
- CRUD completo de eventos (com upload de banner via MinIO)
- Gestão de participantes (tabela, filtros, exportação CSV)
- Dashboard financeiro (receita bruta/líquida, comissões, solicitação de repasse)
- Loja de produtos (catálogo, CRUD de produtos, config Asaas)
- Gestão de Staff (CRUD, cargos, credenciais automáticas, financeiro)
- Banco de Talentos
- Gestão de Fornecedores (contratos, cotações, despesas)
- Relatórios analíticos
- Designer de Ingressos visual
- PDVs físicos com comissionamento
- Check-in (scan + histórico)
- Configurações

**Painel Master:**
- Dashboard com métricas globais
- Gestão de organizadores (aprovação, permissões)
- Dashboard financeiro global
- Transações e repasses
- Gestão de comissões
- Aprovação de eventos
- Relatórios avançados
- Central de alertas
- Configurações globais da plataforma

**Portal do Staff:**
- Dashboard com próximos eventos
- Propostas (aceitar/recusar)
- Agenda
- Financeiro do colaborador
- Perfil profissional

### Out of Scope (v1)

- Modo offline para check-in
- Aplicativo mobile nativo
- White-label Enterprise
- Copilot de IA para produtores
- Cockpit de Marketing Premium (ROI por canal UTM) — Fase 3
- CRM nativo com automações — Fase 3
- Projeção de público com alertas — Fase 3
- Integração com catracas físicas

---

## 5. Functional Requirements

| Priority | Requirement | Notes |
|---|---|---|
| Must | Auth multi-perfil: Comprador, Organizador, Staff, Master | Appwrite Auth + permissões por role |
| Must | Criação e publicação de eventos com formulário validado | Zod validation, upload de banner via MinIO |
| Must | Configuração de múltiplos lotes/tipos de ingresso por evento | Modal TicketModal, preços e capacidades |
| Must | Checkout 3 etapas: dados pessoais + foto + pagamento | Upload foto → MinIO; Asaas PIX/Cartão |
| Must | Geração de QR Code único por ingresso após pagamento confirmado | UUID v4, armazenado no Appwrite DB |
| Must | Validador de QR Code para check-in com verificação da foto | /validador, cross-ref foto do MinIO |
| Must | Dashboard do Organizador com visão geral de eventos e receita | TanStack Query + Appwrite Realtime |
| Must | Dashboard do Comprador com ingressos e status | Filtros por status: Válido/Utilizado/Cancelado |
| Must | Painel Master: aprovação de organizadores e eventos | Workflow de aprovação com status |
| Must | Integração Asaas: PIX e Cartão de Crédito | Webhook para confirmação de pagamento |
| Must | Multi-tenant: isolamento de dados por organizador | Appwrite Teams ou permissões por documento |
| Should | Designer visual de ingressos (3 layouts) | Editor com cores, logo, fonte, preview |
| Should | PDV físico com tipos de comissionamento | Fixo, percentual, por ingresso |
| Should | Gestão de Staff: CRUD, cargos, envio de credenciais | E-mail automático via Appwrite Functions |
| Should | Gestão de fornecedores: contratos (PDF/MinIO), cotações, despesas | Upload de contratos → MinIO |
| Should | Dashboard financeiro completo com solicitação de repasse | Integração Asaas para transferências |
| Should | Portal do Staff: propostas, agenda, financeiro | Appwrite Realtime para notificações |
| Should | Fan Page da Produtora com timeline, eventos e vagas | Slug único por organizador |
| Should | Relatórios analíticos por evento (gráficos, exportação) | Recharts + exportação CSV |
| Could | Loja de merchandising com gestão de estoque | Módulo independente, config Asaas |
| Could | Banco de Talentos público com busca por função/cidade | Feed de profissionais disponíveis |
| Could | Central de alertas Master (fraudes, reportes) | Regras automáticas via Appwrite Functions |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Carregamento inicial < 2s; API responses < 500ms p95; Checkout < 3s |
| Security | Auth via Appwrite Sessions/JWT; dados criptografados; antifraude no checkout; LGPD compliant |
| Availability | 99.5% uptime; backup diário de banco e MinIO |
| Accessibility | WCAG 2.1 AA nas telas de compra e checkout |
| Scalability | Suporte a 1k usuários simultâneos no lançamento; arquitetura escalável horizontalmente |
| LGPD | Consentimento explícito para foto biométrica; direito de exclusão de dados do comprador |
| Mobile-first | Checkout e validador totalmente responsivos para uso em smartphones |

---

## 7. Proposed Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Já definido no PRD; HMR rápido, ecosistema maduro |
| Styling | Tailwind CSS | Já definido; agilidade e consistência visual |
| Routing | React Router v6 | SPA com rotas protegidas por role |
| Forms | React Hook Form + Zod | Validação type-safe; performance superior ao Formik |
| Data fetching | TanStack Query (React Query) | Cache, loading states, refetch automático |
| Icons | Lucide React | Já definido; leve e consistente |
| Dates | date-fns (pt-BR) | Já definido; tree-shakeable |
| Charts | Recharts | Dashboards de BI; composable, responsivo |
| BaaS | Appwrite 1.x self-hosted | Auth, Database, Storage, Functions, Realtime — tudo em um |
| Object Storage | MinIO self-hosted | Banners, fotos biométricas, contratos PDF, logos |
| Payment | Asaas API | PIX + Cartão; mercado BR; split de pagamento nativo |
| QR Code | qrcode (npm) | Geração client-side de QR Code para ingressos |
| QR Scanner | html5-qrcode | Leitura de QR Code via câmera no validador |
| Infra | Docker Compose | Appwrite + MinIO + Traefik em servidor único |
| Deploy | VPS Linux (Ubuntu 22.04) | Auto-hospedado, controle total, LGPD |

---

## 8. Integrations and Dependencies

| Integration | Type | Notes |
|---|---|---|
| Asaas | REST API + Webhooks | Cobrança PIX/Cartão; confirmação via webhook; repasses |
| Appwrite Auth | SDK | Sessions, JWT, OAuth (futuro), magic links |
| Appwrite Database | SDK | Todas as entidades do sistema |
| Appwrite Storage | SDK | Avatares e assets pequenos |
| Appwrite Functions | Runtime Node.js | Webhooks Asaas, envio de e-mails, automações |
| Appwrite Realtime | WebSocket | Notificações live no dashboard do organizador |
| MinIO | SDK Node.js | Upload direto via presigned URL do frontend |
| SMTP / E-mail | Appwrite Messaging ou Resend | Confirmação de compra, credenciais de staff |

---

## 9. Constraints

- **Budget:** A definir pelo founder
- **Deadline:** Nenhum hard deadline definido; roadmap em fases
- **Team:** Desenvolvimento assistido por IA (Verdent); 1 desenvolvedor humano para revisão
- **Technical:** Stack já parcialmente definido no PRD (React + Vite + Tailwind); sem alteração
- **Compliance:** LGPD obrigatório — especialmente para foto biométrica (consentimento explícito no checkout)
- **Infra:** Self-hosted (Appwrite + MinIO) para manter dados no Brasil

---

## 10. Acceptance Criteria

- [ ] Organizador consegue criar, publicar e vender ingressos de ponta a ponta
- [ ] Comprador consegue comprar ingresso (PIX e Cartão) e receber QR Code
- [ ] Validador lê QR Code e exibe foto + status do ingresso em < 1s
- [ ] Painel Master consegue aprovar/rejeitar organizadores e eventos
- [ ] Staff consegue acessar o portal, ver propostas e confirmar participação
- [ ] Dados de diferentes organizadores são completamente isolados
- [ ] Checkout coleta e armazena foto biométrica com consentimento explícito
- [ ] Webhook Asaas atualiza status do ingresso em tempo real após pagamento
- [ ] Sistema funciona corretamente em dispositivos móveis (iOS Safari, Android Chrome)
- [ ] Nenhum dado sensível (CPF, dados de cartão) é armazenado localmente — tudo via Asaas tokenizado

---

## 11. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Appwrite não suporta carga de produção no lançamento | Low | High | Configurar índices corretamente; monitorar com Appwrite Console; plano de migração para self-hosted maior |
| Webhook Asaas com delay causando ingresso não gerado | Med | High | Implementar polling de fallback + status "Pendente" visível ao comprador |
| Foto biométrica gera reclamações de privacidade (LGPD) | Med | High | Consentimento explícito com texto claro; opção de exclusão nos settings |
| Complexidade do multi-tenant com Appwrite | Med | Med | Usar Appwrite Teams para isolamento; testar com múltiplos organizadores antes do lançamento |
| Escopo muito amplo atrasa o MVP | High | High | Seguir rigorosamente o roadmap em fases; Fase 1 antes de qualquer feature de Fase 2 |
| MinIO sem backup causa perda de fotos biométricas | Low | High | Backup diário automatizado do volume MinIO; política de retenção definida |

---

## 12. Next Steps

### Fase 1 — MVP (Publicação + CRM Básico + RSVP)
1. **Epic: Infraestrutura Base** — Docker Compose (Appwrite + MinIO + Traefik), variáveis de ambiente, CI básico
2. **Epic: Auth e Multi-tenant** — Registro/login por role, proteção de rotas, Appwrite Teams por organizador
3. **Epic: Área Pública** — Vitrine, listagem de eventos, página de detalhes, /para-produtores
4. **Epic: Criação de Eventos** — Formulário completo, upload de banner MinIO, publicação
5. **Epic: Checkout** — 3 etapas, upload de foto, integração Asaas PIX, geração de QR Code
6. **Epic: Painel do Comprador** — Dashboard, listagem de ingressos, QR Code viewer
7. **Epic: Painel do Organizador Básico** — Dashboard, participantes, financeiro básico

### Fase 2 — Ticketing Completo + Operação
8. **Epic: Checkout Cartão de Crédito** — Integração Asaas cartão + webhook
9. **Epic: Validador de Check-in** — /validador com QR scanner + verificação de foto
10. **Epic: Gestão de Staff** — CRUD, cargos, credenciais automáticas, portal do staff
11. **Epic: PDV e Loja** — PDVs físicos, loja de merchandising
12. **Epic: Designer de Ingressos** — Editor visual com 3 layouts
13. **Epic: Painel Master** — Aprovação, financeiro global, alertas

### Sprint 1 — Começar por:
- Setup do repositório (Vite + React + TypeScript + Tailwind + React Router)
- Docker Compose com Appwrite + MinIO
- Schema do banco de dados (collections do Appwrite)
- Auth base (login, registro, proteção de rotas por role)

---

## Open Questions

- [ ] Qual o plano de hospedagem inicial? (VPS provider, RAM/CPU mínimo para Appwrite + MinIO)
- [ ] O sistema de repasse do Asaas será automático (split) ou manual (saque pelo organizador)?
- [ ] Haverá período de aprovação manual de organizadores no lançamento ou aprovação automática?
- [ ] A foto biométrica no checkout será exigida também para ingressos gratuitos?
- [ ] Qual o SLA de suporte esperado para os primeiros organizadores?
