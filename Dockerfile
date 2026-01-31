# Use Node.js LTS (Long Term Support)
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies (including devDependencies to build TS)
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (optional, but good practice for keep-alive)
EXPOSE 3000

# Start the bot
CMD [ "npm", "run", "start:bot" ]
