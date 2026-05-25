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
				FLUTTERWAVE_SECRET_KEY: string;
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
				PUBLIC_FIREBASE_AUTH_DOMAIN: string;
				PUBLIC_FIREBASE_PROJECT_ID: string;
				PUBLIC_FIREBASE_STORAGE_BUCKET: string;
				PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
				PUBLIC_FIREBASE_APP_ID: string;
				PUBLIC_FIREBASE_MEASUREMENT_ID: string;
				PUBLIC_CONVEX_URL: string;
				PUBLIC_EWIN_REFERRAL_HTTP_URL: string;
				PUBLIC_VAPID_PUBLIC_KEY: string;
				ADMIN_EMAIL: string;
				ADMIN_PASSWORD: string;
				ADMIN_SESSION_SECRET: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
