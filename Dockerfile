FROM node:18

# Create app directory
WORKDIR /app

# Give ownership to user 1000 (Hugging Face default user)
RUN chown -R 1000:1000 /app

COPY --chown=1000 package*.json ./

RUN npm install

COPY --chown=1000 . .

RUN npm run build

# Essential for HF: Use the non-root user
USER 1000

# Set environment variable to ensure Node handles DNS correctly
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

EXPOSE 7860

# Force the container to use Google's DNS
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf

CMD [ "npm", "run", "start:bot" ]