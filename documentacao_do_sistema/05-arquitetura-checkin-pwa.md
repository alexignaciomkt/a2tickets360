# 🛰️ Guia de Tutorial 05: Arquitetura de Check-in e Modo Offline (PWA)

Este documento descreve a infraestrutura técnica e o funcionamento do sistema de portaria, focado em alta disponibilidade e resiliência.

---

## 🎯 Objetivo da Funcionalidade
Permitir que a equipe de portaria (Staff) valide ingressos com velocidade instantânea, mesmo em ambientes com internet instável ou inexistente, garantindo a entrada fluida dos participantes.

## 👥 Atores
- **Staff**: Utiliza o celular (PWA) para escanear ingressos.
- **Master Admin/Produtor**: Acompanha o gráfico de entradas em tempo real.

---

## 🏗️ Pilares da Tecnologia

### 1. Progressive Web App (PWA)
O sistema de portaria não requer instalação via App Store. Ele funciona diretamente no navegador, mas pode ser "instalado" na tela inicial do celular. Isso garante que o staff sempre tenha a versão mais recente sem precisar de atualizações manuais.

### 2. Sincronização Inteligente (Offline-First)
O segredo da velocidade da Ticketera está no uso do **IndexedDB** (banco de dados local do navegador).
- **Início do Evento**: O app baixa uma lista compacta (hash) de todos os ingressos vendidos.
- **Validação Local**: A checagem acontece no celular do staff (latência zero).
- **Sync**: O app tenta enviar os dados para a nuvem a cada 30 segundos. Se falhar, ele tenta novamente assim que o sinal retornar.

---

## 📑 Roteiro de Uso para o Staff

1. **Acesso**: O staff loga com suas credenciais específicas de portaria.
2. **Sincronismo Inicial**: O app exibe uma barra de progresso: "Baixando lista de convidados...".
3. **Escaneamento**:
   - O staff aponta a câmera para o QR Code.
   - **Verde**: Ingresso Válido (Mostra Foto + Nome).
   - **Amarelo**: Já Utilizado (Mostra horário da entrada anterior).
   - **Vermelho**: Inválido / Evento Errado.
4. **Busca Manual**: Caso o QR Code esteja ilegível (tela de celular molhada ou riscada), o staff pode buscar pelo CPF ou Nome do comprador.

---

## ⚙️ Bastidores: O que acontece se a internet cair?

1. O app detecta o modo offline e exibe um ícone de "Nuvem com traço".
2. Todas as validações continuam funcionando normalmente contra o banco de dados local.
3. O staff recebe um aviso: "Você está em modo offline. As fotos podem não carregar, mas a validação de segurança continua ativa."
4. Ao recuperar o sinal, um log de sincronização é enviado ao servidor para atualizar o dashboard do produtor.

---

**Última Atualização:** 21 de Abril de 2026
**Responsável:** Agente Escrevente (Antigravity AI)
