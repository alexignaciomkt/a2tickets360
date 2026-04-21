# Guia de Tutorial 02: Dashboard e Métricas (Master Admin)

Este guia detalha o funcionamento dos indicadores de performance e saúde da plataforma vistos pelo administrador Master.

---

## 🎯 Objetivo do Dashboard
Fornecer uma visão macro e em tempo real do crescimento da plataforma, permitindo ao Master identificar rapidamente gargalos de aprovação e volume de vendas.

---

## 📊 Entendendo os Cartões de Estatísticas

### 1. Usuários Totais
- **O que representa**: O número total de contas criadas na plataforma (clientes, produtores e staff).
- **Por que é importante**: Mede o alcance da plataforma e a base de leads/usuários ativos.

### 2. Organizadores Ativos
- **O que representa**: O número de produtores que já tiveram seu cadastro revisado e **aprovado** por você.
- **Observação**: Se um produtor se cadastrou mas ainda está pendente, ele não conta aqui, apenas no card de "Aguardando Aprovação" da gestão de organizadores.

### 3. Eventos Aguardando
- **O que representa**: Sua fila de trabalho imediata. São eventos que foram finalizados pelos produtores e aguardam seu "OK" para irem ao ar.
- **Ação sugerida**: Sempre que este número estiver acima de 0, há produtores esperando para começar a vender.

### 4. Eventos este Mês
- **O que representa**: O volume de novos eventos criados desde o primeiro dia do mês atual.
- **Importância**: Ajuda a medir a velocidade de crescimento e a tração da plataforma mês a mês.

---

## 📑 Roteiro do Vídeo: Tour pelo Painel Master

### 1. Introdução
- "Seja bem-vindo ao coração administrativo da Ticketera. Aqui você tem o controle total sobre quem entra e o que é vendido."

### 2. Mostrando os Números
- Aponte para os cartões e explique a diferença entre **Usuários Totais** e **Organizadores Ativos**.
- Destaque o cartão de **Eventos Aguardando** como a prioridade do dia.

### 3. Módulos de Gestão
- Explique brevemente que abaixo das estatísticas estão os atalhos para:
    - **Gerenciar Organizadores**: Para aprovar novos parceiros.
    - **Aprovar Eventos**: Para revisar o conteúdo antes de publicar.
    - **Financeiro**: Para ver as comissões da plataforma.

---

## ⚙️ Bastidores (Lógica Técnica)
- **Cálculo Mensal**: O sistema reseta o contador de "Eventos este Mês" automaticamente à meia-noite do primeiro dia de cada mês, comparando a data atual com o campo `created_at` no banco de dados.
- **Sincronização**: Os dados são atualizados toda vez que a página é carregada ou quando uma ação de aprovação é concluída.

---

## 🎙️ Sugestão de Script
> "No seu painel principal, você tem o termômetro do seu negócio. O card 'Eventos este Mês' é o seu melhor amigo para medir o crescimento. Se você notar que o número de 'Eventos Aguardando' está subindo, é hora de dar aquela passadinha na aba de Aprovação para garantir que seus produtores comecem a vender o quanto antes!"
