import http from 'http';

export function keepAlive() {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('I am alive! Forgotten Spins Bot is running.');
        res.end();
    });

    const port = process.env.PORT || 3000;

    server.listen(port, () => {
        console.log(`Keep-alive server is listening on port ${port}`);
    });
}
