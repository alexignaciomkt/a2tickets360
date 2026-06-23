# Stage 1: Build the React/Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies (ci is faster and more reliable)
RUN npm ci

# Copy the rest of the code
COPY . .

# Build (generates dist/)
RUN npm run build

# Stage 2: Nginx web server with crawler detection
FROM nginx:alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the nginx template (NOT the final config — processed at runtime)
COPY .docker/nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Default API upstream — override via environment variable in docker-compose/swarm
ENV OG_API_UPSTREAM=http://ticketera-api:3000

EXPOSE 80

# nginx:alpine image automatically processes /etc/nginx/templates/*.template
# files using envsubst and outputs to /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
