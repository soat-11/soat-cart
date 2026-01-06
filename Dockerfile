# --- Estágio 1: Build ---
FROM node:18 AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento para fazer o build)
RUN npm install

# Copia todo o código fonte
COPY . .

# Gera a pasta /dist (compila o TypeScript)
RUN npm run build

# --- Estágio 2: Produção (Imagem Final Leve) ---
FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala apenas dependências de produção (mais leve e seguro)
RUN npm install --only=production

# Expõe a porta padrão do NestJS (geralmente 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]