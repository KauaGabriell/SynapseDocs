FROM node:18-alpine

# Instalar Git e outras dependências necessárias
RUN apk add --no-cache git openssh-client

WORKDIR /app

# Copiar apenas o package.json do backend primeiro
COPY backend/package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o código do backend
COPY backend ./

# Build do projeto (se houver TypeScript)
RUN npm run build || echo "No build script found, skipping..."

# Expor a porta (Railway usa a variável PORT automaticamente)
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]