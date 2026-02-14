"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// 1. THIS IS THE KEY: Import process from the node compatibility layer
const process = __importStar(require("node:process"));
globalThis.process = process;
// 2. NOW keep your current imports
const lastfm_1 = require("./lastfm");
const analyzer_1 = require("./analyzer");
exports.default = {
    async fetch(request, env) {
        try {
            // Because we set globalThis.process above, these will now work
            // even in nested files like lastfm.ts!
            const apiKey = process.env.LASTFM_API_KEY;
            const username = process.env.LASTFM_USERNAME;
            const periodEnv = process.env.FORGOTTEN_PERIOD || '12month';
            const client = new lastfm_1.LastFmClient(apiKey, username);
            const analyzer = new analyzer_1.Analyzer(client, periodEnv);
            console.log(`Analyzing for ${username}...`);
            const recommendation = await analyzer.getForgottenAlbum();
            if (recommendation) {
                return new Response(`Today's Forgotten Spin: ${recommendation.name} by ${recommendation.artist}`);
            }
            return new Response("No forgotten spins found today.");
        }
        catch (error) {
            return new Response(`Error: ${error.message}`, { status: 500 });
        }
    }
};
