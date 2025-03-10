FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy src directory explicitly
COPY src ./src/

# Copy any other necessary files
COPY . .

# Debug: List contents
RUN echo "Contents of /app:"
RUN ls -la
RUN echo "Contents of /app/src:"
RUN ls -la src

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"] 