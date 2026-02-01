import http from 'http';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

export function keepAlive() {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('I am alive! Forgotten Spins Bot is running.');
        res.end();
    });

    const port = process.env.PORT || 7860;

    // Explicitly bind to 0.0.0.0 to satisfy HF's network bridge
    server.listen(Number(port), '0.0.0.0', () => {
        console.log(`Keep-alive server is listening on port ${port}`);
    });
}
