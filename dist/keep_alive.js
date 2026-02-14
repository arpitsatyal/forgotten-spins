"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAlive = keepAlive;
const http_1 = __importDefault(require("http"));
function keepAlive() {
    const server = http_1.default.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('I am alive! Forgotten Spins Bot is running.');
        res.end();
    });
    const port = process.env.PORT || 3000;
    server.listen(Number(port), () => {
        console.log(`Keep-alive server is listening on port ${port}`);
    });
}
