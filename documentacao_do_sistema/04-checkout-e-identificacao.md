# 🤳 Guia de Tutorial 04: Checkout e Identificação por Selfie

Este documento descreve o fluxo de compra da plataforma e a camada de segurança baseada em biometria simplificada (Selfie), servindo como roteiro para tutoriais e documentação de suporte.

---

## 🎯 Objetivo da Funcionalidade
Garantir que o portador do ingresso seja a mesma pessoa que o adquiriu, prevenindo fraudes e facilitando o controle de acesso (Check-in) sem a necessidade de documentos físicos complexos em todos os momentos.

## 👥 Atores
- **Comprador (Customer)**: Realiza a compra e fornece a foto.
- **Staff (Portaria)**: Valida a identidade comparando a selfie no sistema com a pessoa presente.

---

## 📑 Fluxo do Checkout (Passo a Passo)

### 1. Seleção de Ingressos
- O usuário escolhe o evento e os tipos de ingressos.
- **Destaque**: O sistema já identifica se o usuário está logado para preencher os dados automaticamente.

### 2. Captura da Selfie (Mailing Gold & Segurança)
- **Obrigatoriedade**: A cada nova compra, uma nova selfie é exigida.
- **Interface**:
    - Mobile: Abre a câmera frontal instantaneamente.
    - Desktop: Permite o upload ou uso da webcam.
- **Regra Técnica**: A foto é enviada para o Storage em `customers/{nome}-{id}/selfies/`.

### 3. Preenchimento de Dados de Contato
- Coleta de Nome, E-mail, CPF e WhatsApp.
- **Inteligência de Dados**: Estes dados alimentam o **Mailing Gold**, permitindo que o produtor tenha uma base de leads qualificada para futuros eventos.

---

## 📑 Roteiro para o Staff (Validação no Evento)

### 1. Leitura do QR Code
- O Staff utiliza o aplicativo de check-in para ler o ingresso do cliente.

### 2. Painel de Verificação
- Ao ler o código, o sistema exibe:
    - **Foto da Selfie** (em destaque).
    - Nome do Titular.
    - Status do Ingresso.
- **Ação**: O Staff confirma visualmente se a pessoa é a mesma da foto e clica em **"Confirmar Entrada"**.

---

## ⚙️ Bastidores e Governança de Dados

1. **Privacidade**: As selfies são dados sensíveis. Elas são exibidas apenas no momento do check-in e deletadas automaticamente após o uso (conforme política no Documento 03).
2. **Mailing Gold**: Mesmo após a exclusão da selfie, os dados textuais (Nome/E-mail) permanecem vinculados ao evento para análise de BI e marketing direto pelo produtor.

---

## 🎙️ Sugestão de Script para Tutorial
> "Segurança é prioridade na Ticketera. Durante o checkout, pedimos uma selfie rápida do comprador. Isso elimina a necessidade de filas longas e conferência manual de RG na entrada. Para o staff, basta ler o QR Code, ver a foto na tela e liberar a entrada. Prático, rápido e seguro!"

---

**Última Atualização:** 21 de Abril de 2026
**Responsável:** Antigravity AI Agent
