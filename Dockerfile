# Dockerfile (server/)
FROM node:20-alpine
WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

# If you use TypeScript and need to build, uncomment the next line:
# RUN npm run build

# Expose the port your app listens on
EXPOSE 5000

# Default command: change to match your project entrypoint if needed
CMD ["node", "dist/server.js"]
