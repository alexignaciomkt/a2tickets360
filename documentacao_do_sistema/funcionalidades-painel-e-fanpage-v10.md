# Documentação de Atualizações - Painel do Produtor & FanPage (v10)

Data: 26 de Abril de 2024
Versão: 1.0.0
Status: Implementado

## 1. Editor de Texto Rico (Rich Text)
Implementação de um editor visual para campos de texto longo, permitindo maior expressividade na comunicação da marca.

*   **Tecnologia**: `react-quill`.
*   **Funcionalidades**:
    *   Formatação básica: Negrito, Itálico, Sublinhado.
    *   Estilização: Tamanho de fonte, cor de texto, cor de fundo.
    *   Estrutura: Listas (numeradas e bullets), alinhamento.
    *   Extras: Inserção de links e emojis.
*   **Renderização**: Na FanPage, o conteúdo é processado via Tailwind Typography (`prose`), garantindo que o HTML gerado mantenha a estética premium do sistema.

## 2. Personalização de Títulos de Seção
Liberdade para o produtor adaptar a nomenclatura das seções de acordo com seu nicho de atuação.

*   **Campos Configuráveis**:
    *   Título da Agenda (Eventos).
    *   Título da Seção Sobre (História).
    *   Título da Galeria (Memórias).
    *   Título de Depoimentos.
*   **Comportamento**: Caso o produtor não defina um título, o sistema utiliza um fallback padrão elegante.

## 3. Reestruturação do Painel de Configurações
Otimização da jornada do usuário ao separar dados administrativos de dados de marketing.

*   **Aba "Vitrine Pública"**: Focada em branding. Contém Bio, Títulos de Seções e Imagem de Apresentação.
*   **Aba "Dados da Empresa"**: Focada em compliance e contato.
    *   **Novidade**: Adição do campo **CPF/CNPJ (Documento)**.
    *   Agrupamento de Nome Social, Email de contato e Localização.
*   **Aba "Identidade Visual"**: Centralização de Logo e Banner.

## 4. Evolução Visual da FanPage
Refinamentos estéticos para garantir um visual "WOW" e alta performance em dispositivos móveis e notebooks.

*   **Banner Responsivo**: Limitação de largura máxima (`max-w-[1400px]`) e altura automática para evitar cortes indesejados em telas grandes ou notebooks.
*   **Identidade Limpa**: Remoção do bloco de avatar central redundante, aproveitando melhor a área do banner e a logo na Topbar.
*   **Navbar Evoluída**: Inclusão do botão "Trabalhe Conosco" (Jobs/Vagas) para expandir o ecossistema da produtora.
*   **Correção de Layout**: 
    *   Ajuste de paddings entre seções (50px inferior / 30px superior no destaque).
    *   Remoção de margens negativas que causavam sobreposição de elementos ("encavalamento").

## 5. Seção "Sobre" com Imagem Personalizada
Substituição da repetição automática do logo por uma imagem contextual.

*   **Painel**: Novo seletor de imagem específico para a história da marca.
*   **Layout**: Remoção da miniatura circular sobreposta, permitindo que a imagem principal da seção brilhe sem obstruções visuais.
*   **Fallback**: Caso nenhuma imagem seja enviada, o sistema utiliza o Logo como plano de fundo da seção.

---
**Notas Técnicas**:
- Dependências adicionadas: `react-quill`.
- Estrutura de dados: As novas configurações estão armazenadas no campo `settings` do perfil do organizador no Supabase.
