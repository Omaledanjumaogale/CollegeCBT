// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {}
		interface Locals {}
		interface PageData {}
		interface PageState {}
		interface Platform {
			env: {
				ANTHROPIC_API_KEY: string;
				RESEND_API_KEY: string;
				FLUTTERWAVE_SECRET_KEY: string;
				KORAPAY_SECRET_KEY: string;
				PUBLIC_FIREBASE_API_KEY: string;
				PUBLIC_CONVEX_URL: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
