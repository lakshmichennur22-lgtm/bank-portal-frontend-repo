FROM node:18

# Set working directory
WORKDIR /frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project source
COPY . .

# Expose application port
EXPOSE 3000

# Start app
CMD ["npm", "start"]