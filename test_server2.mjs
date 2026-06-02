process.env.PUBLIC_CONVEX_URL = 'https://different-warthog-453.eu-west-1.convex.cloud';
process.env.PUBLIC_APP_URL = 'https://collegecbt.ewinproject.org';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    try {
        const manifest = JSON.parse(readFileSync(path.join(__dirname, '.svelte-kit', 'output', 'server', 'manifest.json'), 'utf-8'));
        const mod = await import('./.svelte-kit/output/server/index.js');
        const server = new mod.Server(manifest);
        await server.init({ env: process.env });
        console.log('Server initialized');
        
        const response = await server.respond(new Request('http://localhost:4186/'));
        console.log('Response status:', response.status);
        const text = await response.text();
        // Check for error
        if (response.status !== 200) {
            console.log('ERROR BODY:', text.substring(0, 2000));
        } else {
            console.log('SUCCESS! Body starts:', text.substring(0, 200));
        }
    } catch (err) {
        console.error('ERROR:', err.message);
        console.error('Stack:', err.stack);
    }
}

main();
