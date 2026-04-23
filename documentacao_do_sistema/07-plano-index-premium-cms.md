# Documentação: Ticketera Premium Index & CMS

Este documento detalha a reformulação da página principal e a infraestrutura de monetização e conteúdo.

## Visão Geral
Transformar a Index em uma máquina de monetização e SEO, mantendo uma estética premium e minimalista.

## Requisitos de Negócio

### 1. Hero Imersivo (Monetização Direta)
- **Formato**: Carrossel rotativo (máx. 10 banners).
- **Interatividade**: Apenas um botão CTA direcionando ao evento.
- **Design**: Banners limpos, sem textos sobrepostos (o design do banner deve falar por si).
- **Fonte**: Carregado pelo produtor mediante pagamento (checkout interno).

### 2. Monetização Inteligente (ADS)
- Banners horizontais e inserções nativas (estilo grid) integradas organicamente.

### 3. Blog (SEO Programático)
- Painel de controle no Master Admin com suporte a automação via IA para criação de matérias.

## Estrutura de Dados (Migração SQL)

```sql
-- Configurações Dinâmicas do Site
CREATE TABLE site_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog para SEO
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES profiles(user_id),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}'
);

-- Gerenciamento de ADS e Destaques (Hero)
CREATE TABLE site_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    position TEXT NOT NULL, -- 'hero_main', 'mid_page', 'native_grid'
    region_id TEXT DEFAULT 'global', -- Suporte a Geo-localização
    producer_id UUID REFERENCES profiles(user_id),
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Backlog de Evolução (Futuro Próximo)
- **Checkout de Destaque**: Automação para o produtor comprar o destaque do evento via painel.
- **Geo-localização**: Sistema para exibir os 10 banners do Hero baseados na região do usuário (detectada via IP/Browser).

## Próximos Passos
1. Execução do SQL no Supabase via MCP.
2. Criação do rascunho visual (Mockup).
3. Implementação do novo `Index.tsx`.
