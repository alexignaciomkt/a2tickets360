# 📁 Estrutura de Storage e Política de Retenção de Dados

Este documento descreve a organização do sistema de arquivos (MinIO/S3) e as regras de governança de dados para garantir performance, economia de storage e conformidade com a LGPD.

## 🏗️ Estrutura de Pastas (Bucket: `a2tickets360`)

Para facilitar o controle visual e a organização multi-tenant, utilizamos o padrão `{identificador-amigavel}-{UUID}`.

### 1. Produtores (`/producers`)
Armazena todos os assets vinculados aos organizadores de eventos.
- **Caminho:** `producers/{slug-do-produtor}-{userId}/`
- **Subpastas:**
  - `/logos/`: Logotipos da empresa.
  - `/banners/`: Imagens de capa dos eventos.
  - `/feed/`: Fotos e mídias postadas no mural do organizador.
  - `/documents/`: Documentos de verificação (RG/CNPJ). *Acesso Restrito.*

### 2. Clientes (`/customers`)
Armazena dados sensíveis e fotos de perfil dos compradores.
- **Caminho:** `customers/{nome-comprador}-{userId}/`
- **Subpastas:**
  - `/profile/`: Foto de perfil do usuário.
  - `/selfies/`: Fotos de identificação capturadas durante o checkout. *Regra de descarte agressiva.*

### 3. Staff e Sistema (`/staff` | `/public`)
- **`/staff/`**: Documentos e fotos da equipe interna.
- **`/public/`**: Assets genéricos, ícones de categoria e imagens padrão do sistema.

---

## 🧹 Política de Retenção e Limpeza (Cron Jobs)

A Ticketera adota uma política de **"Data-Driven, Media-Light"**. Mantemos o registro histórico no banco de dados (Mailing Gold), mas limpamos periodicamente arquivos pesados ou sensíveis.

| Tipo de Dado | Gatilho de Limpeza | Ação no Storage | Ação no Banco de Dados |
| :--- | :--- | :--- | :--- |
| **Selfies de Checkout** | Ticket marcado como `used` ou +24h pós-evento. | DELETAR arquivo físico. | Limpar `selfie_url` (NULL). |
| **Rascunhos de Eventos** | Sem atividade por 30 dias e 0 vendas. | DELETAR todos os assets. | Deletar registro do evento. |
| **Eventos Encerrados** | **48 horas** após o término do evento. | **ZIPAR assets** (banners, FAQ, desc) -> Enviar ao Produtor por E-mail -> DELETAR do Storage. | Manter registro (Mailing Gold) para BI. |
| **Feed do Produtor** | Contínuo. | Limitar nº de fotos e comprimir arquivos. | Manter histórico visual do produtor. |
| **Cancelados** | 7 dias após o cancelamento. | DELETAR todos os assets. | Manter registro do cancelamento. |

---

## 🏷️ Tags Dinâmicas e Visibilidade de Eventos

Para garantir que a plataforma esteja sempre atualizada ("viva"), aplicamos tags automáticas nos banners e miniaturas:

1. **🔴 Acontecendo**: Aplicada automaticamente quando a data/hora atual está entre o início e o fim do evento. Esta tag acompanha o evento em todas as telas.
2. **🏁 Encerrado**: Aplicada assim que o horário de término é ultrapassado.
   - **Regra de Visibilidade**: O evento com tag "Encerrado" permanece visível por apenas **48 horas**.
   - **Engajamento Final**: Durante estas 48h, o usuário que acessa o evento é convidado a responder uma enquete padrão de satisfação para coleta de dados para o produtor.

---

## 🛡️ Segurança e Privacidade (LGPD)

1. **Selfie Única:** É obrigatória a captura de uma nova selfie a cada compra. Nenhuma selfie é reaproveitada de eventos anteriores por segurança biométrica.
2. **Mailing Gold:** Dados de Nome, E-mail, Telefone e CPF são considerados ativos estratégicos e **não são apagados** (exceto por solicitação explícita do titular), servindo para a base de dados marketing e inteligência de vendas.
3. **Isolamento:** O acesso às pastas de `/documents/` e `/selfies/` deve ser restrito via políticas de IAM para que apenas o Admin Master e sistemas autorizados consigam visualizar.

---

**Última Atualização:** 21 de Abril de 2026
**Responsável:** Antigravity AI Agent
