# Use Node.js LTS (Full version to avoid DNS/Network issues on HF)
FROM node:18

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

# Expose port (Hugging Face default)
EXPOSE 7860

# Start the bot
CMD [ "npm", "run", "start:bot" ]
