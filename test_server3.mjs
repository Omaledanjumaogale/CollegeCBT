process.env.PUBLIC_CONVEX_URL = 'https://different-warthog-453.eu-west-1.convex.cloud';
process.env.PUBLIC_APP_URL = 'https://collegecbt.ewinproject.org';

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    try {
        const manifestMod = await import('./.svelte-kit/output/server/manifest.js');
        const mod = await import('./.svelte-kit/output/server/index.js');
        const server = new mod.Server(manifestMod.manifest);
        await server.init({ env: process.env });
        console.log('Server initialized');
        
        const response = await server.respond(new Request('http://localhost:4186/'));
        console.log('Response status:', response.status);
        const text = await response.text();
        if (response.status !== 200) {
            console.log('ERROR BODY:', text.substring(0, 3000));
        } else {
            console.log('SUCCESS! Body starts:', text.substring(0, 300));
        }
    } catch (err) {
        console.error('ERROR:', err.message);
        console.error('Stack:', err.stack);
    }
}

main();
