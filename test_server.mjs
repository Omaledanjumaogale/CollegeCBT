process.env.PUBLIC_CONVEX_URL = 'https://different-warthog-453.eu-west-1.convex.cloud';
process.env.PUBLIC_APP_URL = 'https://collegecbt.ewinproject.org';

async function main() {
    try {
        const mod = await import('./.svelte-kit/output/server/index.js');
        const server = new mod.Server({
            dev: false,
            csp: {mode: 'auto', directives: {'upgrade-insecure-requests': false, 'block-all-mixed-content': false}, reportOnly: {'upgrade-insecure-requests': false, 'block-all-mixed-content': false}}
        });
        await server.init({ env: process.env });
        console.log('Server initialized successfully');
        
        const response = await server.respond(new Request('http://localhost:4186/'));
        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response body (first 500 chars):', text.substring(0, 500));
    } catch (err) {
        console.error('ERROR:', err.message);
        console.error('Stack:', err.stack);
    }
}

main();
