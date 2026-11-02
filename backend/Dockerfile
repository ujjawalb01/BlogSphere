# Use Node.js LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]