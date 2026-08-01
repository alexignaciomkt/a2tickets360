# Registro de Brainstorm: Jornada de Promoters (Ticketera V1)

**Data do Brainstorm:** 30 de Julho de 2026, às 19:19 (Horário Local)
**Objetivo:** Preservar o contexto técnico e as decisões tomadas para a implementação do sistema de promoters após o reinício da IDE e ativação do MCP do Supabase.

---

## 1. Decisão de Infraestrutura Atual (V1)
- O sistema permanecerá usando o **Supabase Gratuito (SaaS)**. Com 5 GB de banda e 500 MB de armazenamento, ele suporta de 10.000 a 25.000 ingressos vendidos por mês se o front-end for otimizado (ex: caching, limites nas queries).
- **Servidor de Backup:** O cliente possui uma VPS na Hetzner (modelo CX23, 4GB RAM, 40GB NVMe, 20TB Tráfego Out) hospedando o front e o MinIO. Caso a V1 estoure o limite gratuito do Supabase, será feita a migração para **Supabase Self-Hosted** dentro dessa exata VPS, o que resolverá 100% os problemas de custos de escala e banda.

## 2. A Nova Jornada de Promoters (Estilo Marketplace de Afiliação)
O sistema não usará mais promoters engessados para produtores específicos, e sim um modelo escalável (como Monetizze/Hotmart):
- **O Produtor:** Ao criar o evento, marca um "toggle" para liberar afiliação. Define a Comissão Padrão (%) e o desconto (se houver).
- **O Promoter:** Vê uma "Vitrine" de eventos abertos e pede afiliação. O Produtor aprova ou rejeita (avaliando conflito de interesses).
- **Pagamento:** Não há botão manual de "solicitar saque". O pagamento aos promoters ocorrerá no modelo de **Split de Pagamento Automático via Asaas**. O cliente paga o ingresso, a API Asaas retém a comissão do Promoter para o `asaas_wallet_id` dele, e envia o resto ao Produtor.

## 3. Alterações Pendentes no Banco de Dados (Supabase SQL)
Assim que a IDE reiniciar e o MCP estiver ativo (via `mcp_config.json`), estes são os schemas a serem criados/modificados:

- **Nova Tabela `promoters`**: Vinculada a `profiles`, guardando `asaas_wallet_id`.
- **Nova Tabela `promoter_affiliations`**: Relacionamento N:N entre Eventos e Promoters (event_id, promoter_id, coupon_code, commission_rate, status 'pending'/'approved').
- **Alteração na Tabela `events`**: Adição de `accepts_promoters`, `promoter_commission_rate`.
- **Alteração nas Tabelas `sales` e `purchased_tickets`**: Adição de tracking (`promoter_id` e origem/UTM) para que o produtor saiba exatamente qual promotor ou tráfego pago gerou a venda.

## 4. Configurações Técnicas e Chaves
- O projeto no Supabase é **`osfnqpehvhznrecljjjf`** (as chaves Anon e Service Role já foram providenciadas).
- O URI do banco que foi configurado no MCP é: `postgresql://postgres:[SENHA]@db.osfnqpehvhznrecljjjf.supabase.co:5432/postgres`

## 5. Próximos Passos Pós-Reinicialização
1. Validar se o servidor MCP do Postgres conectou com sucesso.
2. Escrever os scripts SQL de migração baseados nas tabelas do tópico 3.
3. Aplicar os scripts SQL no Supabase.
4. Desenvolver o painel de "Vitrine de Afiliações" e o painel de aprovação.
5. Iniciar a integração Asaas (Split) para as vendas dos tickets promovidos.
