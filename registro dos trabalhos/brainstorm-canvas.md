# Brainstorming Canvas — A2 Tickets 360

**Data:** 2026-03-26
**Participantes:** Founder + Verdent AI
**Facilitador:** Verdent

---

## 1. Central Problem

Produtores de eventos de todos os portes operam com ferramentas fragmentadas (planilhas, WhatsApp, Sympla, sistemas isolados de marketing), perdendo controle sobre seus dados, audiência e lucratividade. Não existe no mercado brasileiro uma plataforma que una bilhetagem, CRM, marketing com ROI por canal, operação de staff e inteligência financeira em um único ecossistema centrado no produtor.

---

## 2. Affected Users

| User Type | Context | Pain Level (1–5) |
|---|---|---|
| Produtor Iniciante | Cria eventos esporadicamente, sem ferramentas profissionais | 4 |
| Produtor em Crescimento | Precisa de dados e automação, usa 3-5 ferramentas diferentes | 5 |
| Agência / Grande Produtor | Gerencia múltiplos eventos/equipes, precisa de white-label e BI | 5 |
| Comprador de Ingresso | Experiência fragmentada, insegurança contra fraudes | 3 |
| Staff / Colaborador | Não tem visibilidade de oportunidades, pagamento manual | 3 |
| Administrador da Plataforma | Sem visão consolidada de toda a operação | 4 |

---

## 3. Raw Ideas (No Filter)

- [x] Criação de eventos com formulário inteligente
- [x] Designer visual de ingressos (Clássico/Moderno/Minimalista)
- [x] Checkout em 3 etapas com biometria (foto no ato da compra)
- [x] Check-in via QR Code com validação visual por foto
- [x] Cockpit de marketing em tempo real (ROI por canal Meta/Google/WhatsApp)
- [x] CRM nativo com histórico de compradores e remarketing
- [x] Projeção automática de público e alertas proativos de vendas
- [x] Gestão de staff com escala de turnos e envio automático de credenciais
- [x] Banco de Talentos — pool de profissionais para contratação direta
- [x] PDV físico com comissionamento configurável
- [x] Gestão de fornecedores com contratos, cotações e despesas
- [x] Dashboard financeiro com Receita Bruta/Líquida e solicitação de repasse
- [x] Fan Page da Produtora (timeline, galeria, vagas, loja)
- [x] Loja integrada de merchandising com gestão de estoque
- [x] Painel Master com aprovação de eventos e central de alertas
- [x] Portal do Staff com agenda, propostas e financeiro
- [x] Relatórios analíticos com comparação entre edições
- [x] Modo offline para check-in
- [x] Suporte a ingressos gratuitos (pula etapa de pagamento)
- [x] Multi-tenant (cada organizador isolado)
- [x] Planos de assinatura (Free → Starter → Pro → Enterprise)

---

## 4. Grouping by Theme

### Tema A: Bilhetagem e Vendas
- Criação de eventos + lotes
- Designer de ingressos
- PDV físico
- Checkout 3 etapas + biometria
- Ingressos gratuitos
- QR Code gerado na confirmação

### Tema B: Marketing e CRM
- Cockpit de marketing (ROI por canal)
- Projeção de público + alertas proativos
- CRM nativo + remarketing
- Rastreamento UTM

### Tema C: Operação e Logística
- Gestão de staff (escala, cargos, credenciais)
- Banco de Talentos
- Gestão de fornecedores (cotações, contratos, despesas)
- Check-in QR + verificação biométrica
- Modo offline

### Tema D: Financeiro
- Dashboard financeiro do organizador
- Solicitar repasse
- Gestão Master de repasses e comissões
- Financeiro de staff (cachês)
- Gateway Asaas (PIX + Cartão)

### Tema E: Presença Digital e Comunidade
- Fan Page da Produtora
- Loja de merchandising
- Banco de Talentos (acesso público)
- Vitrine pública de eventos

### Tema F: Administração da Plataforma
- Dashboard Master
- Aprovação de organizadores e eventos
- Central de alertas (fraudes, reportes)
- Relatórios por cidade/data/tipo
- Configurações globais (taxas, gateway, infraestrutura)

---

## 5. MoSCoW Prioritization

| Priority | Item | Rationale |
|---|---|---|
| Must | Auth multi-perfil (Comprador, Organizador, Staff, Master) | Base de tudo |
| Must | Criação e publicação de eventos | Core do produto |
| Must | Checkout 3 etapas (foto + Asaas PIX/Cartão) | Geração de receita |
| Must | QR Code de ingresso + Validador de check-in | Operação presencial |
| Must | Dashboard do Organizador (eventos, participantes, financeiro básico) | Retenção do produtor |
| Must | Dashboard do Comprador (ingressos + QR) | Experiência do cliente |
| Must | Painel Master básico (aprovação de eventos, gestão de organizadores) | Controle da plataforma |
| Should | Designer de ingressos visual | Diferencial de branding |
| Should | PDV físico com comissionamento | Canal de venda adicional |
| Should | Gestão de staff + cargos + credenciais | Operação completa |
| Should | Gestão de fornecedores (contratos, cotações, despesas) | Controle de custos |
| Should | Dashboard financeiro completo (repasses, comissões) | Monetização transparente |
| Should | Portal do Staff (agenda, propostas, financeiro) | Ecossistema de talentos |
| Could | Cockpit de marketing (ROI por canal, UTM) | Módulo Premium |
| Could | CRM nativo + remarketing | Módulo Premium |
| Could | Projeção de público + alertas proativos | Módulo Premium |
| Could | Fan Page da Produtora (timeline, loja, vagas) | Engajamento longo prazo |
| Could | Loja de merchandising | Receita adicional |
| Won't (v1) | Modo offline para check-in | Complexidade técnica alta |
| Won't (v1) | White-label Enterprise | Fase 4 do roadmap |
| Won't (v1) | Copilot de IA para produtores | Fase 4 do roadmap |

---

## 6. Chosen Solution

**Solução:** Plataforma web SPA (React + Vite) com backend Appwrite BaaS e armazenamento de mídia MinIO, estruturada em 4 painéis independentes (Público, Comprador, Organizador, Master) e 1 portal de Staff, com pagamentos via Asaas.

**Por que esta solução:**
Appwrite resolve auth multi-perfil, database multi-tenant, storage, realtime e functions sem necessidade de backend customizado para a maioria dos casos. MinIO resolve armazenamento de mídia pesada (banners, fotos, layouts de ingresso). React + Vite + Tailwind garante velocidade de desenvolvimento e UI de alto padrão. O Asaas é o gateway mais adequado para o mercado brasileiro com suporte nativo a PIX e split de pagamento.

**Premissas assumidas:**
- Appwrite self-hosted (controle total dos dados, compliance LGPD)
- MinIO self-hosted junto ao Appwrite via Docker Compose
- Multi-tenant implementado via Appwrite Teams (1 team por organizador)
- Deploy inicial em VPS/cloud única com Docker Compose

**O que deve ser verdade para o sucesso:**
- Appwrite suporta o volume de transações esperado na fase inicial
- Asaas SDK/API cobre todos os cenários de pagamento necessários
- O stack React + Vite é suficiente para a complexidade dos dashboards de BI

---

## 7. Parking Lot

- Aplicativo mobile nativo (iOS/Android) para check-in
- Integração com sistemas de controle de acesso físico (catracas)
- Transmissão ao vivo de eventos integrada à plataforma
- Programa de afiliados para venda de ingressos
