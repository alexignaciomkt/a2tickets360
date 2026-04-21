# Estágio 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json package-lock.json ./

# Instala as dependências (ci é mais rápido e confiável)
RUN npm ci

# Copia o restante do código
COPY . .

# Roda o build (gera a pasta dist/)
RUN npm run build

# Estágio 2: Servidor Web Nginx
FROM nginx:alpine

# Remove o Nginx padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia as configurações customizadas para SPA
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados no estágio de build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
