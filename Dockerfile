FROM oven/bun:1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json bun.lockb* ./

RUN bun install

# Bundle app source
COPY . .

# Build TypeScript
RUN bun run build

# Expose port
EXPOSE 3000

# Start the bot
CMD [ "bun", "run", "start:prod" ]