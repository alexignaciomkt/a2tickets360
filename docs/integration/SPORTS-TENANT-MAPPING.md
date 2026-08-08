# Mapeamento de Produtor - Ticketera -> Sports

Para que a A2Sports360 consiga provisionar campeonatos em nome de um organizador (produtor) vindo da A2Tickets360, ela precisa reconhecer o `organizer_id` externo. 

Isso é feito através de uma tabela de vínculo (mapping) no banco de dados da **A2Sports360**. Não execute este comando no banco da Ticketera.

## Procedimento Manual

1. Acesse o banco de dados da plataforma **A2Sports360**.
2. Identifique qual é o `id` interno do tenant (organizador) de testes na Sports.
3. Substitua `<ID_DO_TENANT_NA_SPORTS>` no script abaixo pelo ID do tenant da Sports.
4. O UUID `b97dd291-6a3f-4e6a-a610-2eff65915655` é o `id` do organizador na Ticketera.

### Script SQL para o Banco A2Sports360

```sql
-- Garante que o vínculo externo da Ticketera seja criado apontando para o Tenant da Sports
INSERT INTO tenant_external_mappings (
    tenant_id, 
    external_source, 
    external_id, 
    created_at
) VALUES (
    '<ID_DO_TENANT_NA_SPORTS>', 
    'A2TICKETS', 
    'b97dd291-6a3f-4e6a-a610-2eff65915655', 
    NOW()
)
ON CONFLICT (external_source, external_id) 
DO UPDATE SET tenant_id = EXCLUDED.tenant_id, updated_at = NOW();
```

> [!WARNING]
> Esse SQL é projetado para o banco da **A2Sports360** (o sistema recebedor). A inserção garante a unicidade via `ON CONFLICT` evitando duplicação caso você rode duas vezes. Nunca cadastre UUIDs de clientes reais nesse ambiente de testes.
