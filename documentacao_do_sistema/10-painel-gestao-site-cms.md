# Documentação Funcional: Painel de Gestão do Site (CMS Centralizado)

Esta documentação descreve as funcionalidades do novo sistema de Gerenciamento de Conteúdo (CMS) da Ticketera, focado no controle de vitrine, monetização e personalização institucional da plataforma.

## 1. Visão Geral da Arquitetura
O **Painel de Gestão do Site** (`MasterSiteManagement.tsx`) atua como a única fonte de verdade (Single Source of Truth) para o conteúdo dinâmico da página inicial (`Index.tsx`). Ele consolida o gerenciamento de mídias que antes era fragmentado, utilizando uma interface dividida em três eixos de atuação:

- **Banners Principais:** Área hero do site (Topo).
- **Seções da Index:** Blocos institucionais do meio do site.
- **Banners Ads:** Espaços publicitários e configuração de AdSense.

O backend é suportado pela tabela `site_sections` e `hero_banners` no Supabase, utilizando um campo `config` do tipo JSONB para injetar propriedades avançadas de CSS.

---

## 2. Eixos de Funcionalidade (Módulos do Painel)

### 2.1. Gestão de Banners Principais (Hero Carousel)
- **Funcionalidade:** Controle completo sobre o carrossel rotativo localizado no topo da Index.
- **Capacidades:**
  - **Upload de Imagens:** Suporte para imagens de alta resolução que são tratadas via MinIO/Supabase Storage.
  - **Reordenação Dinâmica:** Interface drag-and-drop (`framer-motion`) que altera a propriedade `sort_order` no banco, refletindo instantaneamente a ordem dos slides no site público.
  - **Toggle de Visibilidade:** Opção rápida de ativar/desativar (`is_active`) um banner sem deletá-lo do banco de dados (útil para eventos sazonais).
  - **Links de Redirecionamento:** Cada banner permite definir a URL destino (ex: `/events/nome-do-evento`) do Call-To-Action.

### 2.2. Gestão de Seções Institucionais
- **Funcionalidade:** Permite a customização de blocos fixos da página inicial, especificamente:
  - Seção *Trabalhe Conosco* (`staff_section`).
  - Seção *Produza seu Evento* (`organizer_cta`).
  - Banner *A2 Tickets Pro* (`platform_pro_banner`).
- **Capacidades:**
  - Edição de Título, Subtítulo, Texto do Botão e Imagem de Fundo de forma independente.
  - Habilidade de desativar seções inteiras (`Toggle On/Off`), escondendo-as do site público caso a funcionalidade não esteja disponível (Ex: "Trabalhe Conosco" pode ser desligado caso não haja vagas).

### 2.3. Motor de "Aparência Avançada" (Estilização Dinâmica)
- **Funcionalidade:** O maior diferencial do CMS atual. Permite a mudança estética completa dos blocos sem edição de código.
- **Capacidades de Customização (Campo `config` JSONB):**
  - **Badges (Tags Superiores):** Alteração do texto da Tag, cor de fundo da Tag (Hex) e cor da fonte.
  - **Botões (CTAs):** Personalização da cor de fundo do botão e cor do texto do botão.
  - **Tipografia Escalonável:** O administrador pode selecionar tamanhos pré-definidos do Tailwind (ex: Pequeno, Médio, Gigante) e modificar o HexCode da cor do Título e do Subtítulo para garantir acessibilidade e contraste sobre diferentes imagens de fundo.

### 2.4. Gestão de Ads e Publicidade
- **Banners Patrocinados Natívos:** Quatro blocos de anúncios customizáveis (`home_ad_1` a `home_ad_4`) distribuídos estrategicamente pela tela inicial.
  - Utilizam o mesmo motor de *Aparência Avançada* para permitir que os anúncios tenham as cores das marcas patrocinadoras.
- **Integração Google AdSense:** 
  - Switcher global para ativar/desativar o motor do AdSense em toda a plataforma.
  - Campos para injeção direta de `Client ID` e `Slot ID` do Google para blocos de Sidebar e Footer.

---

## 3. Funcionamento no Frontend (Consumo de Dados)

### Renderização na Página Inicial (`Index.tsx`)
A página inicial realiza requisições para o `cmsService.ts` no evento de montagem (`useEffect`) puxando todas as chaves dinâmicas:
1. Puxa os dados de `hero_banners` com `is_active = true`, ordenados por `sort_order`.
2. Puxa as `site_sections` em paralelo através da instrução `Promise.all`.
3. Injeta o JSON `config` nas propriedades de estilo inline do React.
   - *Exemplo de Uso:* `<h1 style={{ color: section.config?.titleColor }}>{section.title}</h1>`
   - *Exemplo de Classes Dinâmicas:* `className={section.config?.titleSize || 'text-3xl'}`.

### Componente `AdBanner` Dinâmico
O antigo `AdBanner` estático agora é um componente que recebe as tipografias e cores customizadas injetadas pelo master admin, permitindo que a Ticketera venda "Espaços Premium Branded" na página inicial onde todo o bloco reflete a identidade visual da marca parceira.

---

## 4. Filosofia de Design Aplicada (Minimalismo Autoritário)
O painel foi construído seguindo rigorosos padrões do design system de "Luxury Tech":
- **Clean Interface:** Esconde opções complexas (como os seletores de HexCode) dentro de modais (`Dialog`) de edição, mantendo o painel inicial livre de poluição visual.
- **Micro-interações:** Toda ação (reordenar, alterar status, salvar) acompanha toasts silenciosos e transições fluídas para feedback imediato do administrador, atestando confiabilidade do sistema de dados.
