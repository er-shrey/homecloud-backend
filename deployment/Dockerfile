FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package files from root to container
COPY ../package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source from root
COPY ../src ./src

# Expose port (matches what's in your .env)
EXPOSE 3000

# Start the server
CMD ["node", "src/index.js"]
