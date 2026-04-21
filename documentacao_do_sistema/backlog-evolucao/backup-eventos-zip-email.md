# 📦 Backup de Eventos Encerrados (ZIP & Email)

## Descrição
Ao finalizar a visibilidade de um evento (48h após o término), o sistema deve consolidar todos os assets criados pelo produtor e enviar como um pacote de download.

## O que será Zipado?
- Banners do evento (Original e Thumbnails).
- Descrição completa e FAQ.
- Imagens da galeria do local vinculadas ao evento.

## Fluxo
1. Script detecta evento encerrado há 48h.
2. Sistema gera um arquivo `.zip`.
3. Envia link de download ou anexo via e-mail para o produtor.
4. Deleta os arquivos originais do Storage.

---
*Status: Aguardando Implementação*
