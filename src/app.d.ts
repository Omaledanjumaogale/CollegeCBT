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
				FLUTTERWAVE_CLIENT_ID: string;
				FLUTTERWAVE_CLIENT_SECRET: string;
				FLUTTERWAVE_ENCRYPTION_KEY: string;
				FLUTTERWAVE_WEBHOOK_HASH: string;
				PUBLIC_FLUTTERWAVE_PUBLIC_KEY: string;
				KORAPAY_SECRET_KEY: string;
				KORAPAY_ENCRYPTION_KEY: string;
				PUBLIC_KORAPAY_PUBLIC_KEY: string;
				PAYSTACK_SECRET_KEY: string;
				PUBLIC_PAYSTACK_PUBLIC_KEY: string;
				SEERBIT_SECRET_KEY: string;
				PUBLIC_SEERBIT_PUBLIC_KEY: string;
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
