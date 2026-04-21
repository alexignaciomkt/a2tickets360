# Guia de Tutorial 01: Fluxo de Aprovação (Master Admin)

Este documento descreve o funcionamento do sistema de aprovação de Produtores e Eventos, servindo como roteiro para a criação de vídeos tutoriais.

---

## 🎯 Objetivo da Funcionalidade
Garantir que apenas produtores verificados possam publicar eventos na plataforma, mantendo um padrão de qualidade e segurança para os compradores.

## 👥 Atores
- **Master Admin**: Responsável pela revisão e aprovação.
- **Produtor**: Responsável pelo cadastro e criação do evento.

---

## 📑 Roteiro do Vídeo: Aprovação de Organizador

### 1. Localização
- **Onde encontrar**: Menu Lateral > Operações & Staff > Gestão de Organizadores.
- **O que mostrar**: A lista de produtores com o selo "Pendente" (cor âmbar).

### 2. Processo de Revisão
- Clique no botão **"Revisar"** em um produtor pendente.
- **O que explicar**: 
    - Verifique os dados fiscais (CPF/CNPJ).
    - Analise as fotos dos documentos (Frente e Verso).
    - Confira as redes sociais e o site para validar a autenticidade.

### 3. Ações
- **Aprovar**: Transforma o produtor em "Verificado". Isso libera a capacidade dele de ter eventos publicados.
- **Rejeitar**: Bloqueia o acesso e notifica o produtor sobre inconsistências.

---

## 📑 Roteiro do Vídeo: Aprovação de Evento (Hierarquia)

### 1. Localização
- **Onde encontrar**: Menu Lateral > Dashboard (Resumo) ou Gestão de Eventos.

### 2. Regra de Ouro (Importante destacar no vídeo!)
- Mostre que um evento de um produtor **NÃO aprovado** exibe um aviso de "Bloqueado".
- **Explicação**: "Para segurança da plataforma, primeiro aprovamos o produtor, e só depois liberamos a publicação dos seus eventos."

### 3. Atalho de Produtividade
- Mostre o botão **"Gestão de Produtores"** dentro do modal de revisão do evento. 
- Explique que isso permite aprovar o produtor rapidamente sem perder o contexto do evento que está sendo analisado.

### 4. Publicação Final
- Uma vez o produtor aprovado, o botão **"Aprovar e Publicar"** fica verde e ativo.
- Ao clicar, o evento vai ao ar instantaneamente.

---

## ⚙️ Bastidores (O que o sistema faz?)
- **Webhooks**: Ao aprovar, o sistema dispara um aviso para o produtor via WhatsApp/E-mail (se configurado).
- **Segurança**: O sistema de arquivos (Minio) cria uma pasta dedicada para este produtor após a aprovação para organizar seus futuros uploads.

---

## 🎙️ Sugestão de Script
> "Olá! Hoje vamos aprender como gerenciar as aprovações na Ticketera. Como Master, seu papel é fundamental para a segurança. Note que ao abrir um evento, se o produtor ainda não for verificado, o botão de publicação estará bloqueado. Basta clicar em 'Gestão de Produtores', validar os documentos dele, e pronto! Agora você pode voltar e publicar o evento com total segurança."
