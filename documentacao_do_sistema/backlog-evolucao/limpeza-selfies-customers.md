# 🧹 Limpeza Automática de Selfies (Customers)

## Descrição
Desenvolver um sistema automatizado para deletar as fotos de identificação (selfies) capturadas durante o checkout.

## Regras de Negócio
- **Gatilho 1**: Assim que o ticket for marcado como `used` (check-in realizado).
- **Gatilho 2**: 24 horas após o término oficial do evento, para tickets que não foram utilizados.
- **Ação**: Deletar o arquivo físico no MinIO e limpar o campo `selfie_url` no banco de dados.

## Objetivos
- Garantir a privacidade do usuário (LGPD).
- Reduzir custos de armazenamento de mídia.
- Minimizar riscos em caso de vazamento de dados.

---
*Status: Aguardando Implementação*
