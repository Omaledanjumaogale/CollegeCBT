// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces.
import type {
	CfProperties,
	D1Database,
	DurableObjectNamespace,
	ExecutionContext,
	KVNamespace,
	R2Bucket
} from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			user?: {
				id: string;
				email?: string;
				role?: 'user' | 'admin';
			};
		}
		interface PageData {}
		interface PageState {}
		interface Platform {
			env: {
				PUBLIC_APP_ENV: string;
				PUBLIC_APP_NAME: string;
				PUBLIC_APP_URL: string;
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
				// Future Cloudflare bindings. Uncomment in wrangler.toml and make these required when used.
				MY_KV?: KVNamespace;
				DB?: D1Database;
				MY_BUCKET?: R2Bucket;
				MY_DURABLE_OBJECT?: DurableObjectNamespace;
			};
			cf?: CfProperties;
			ctx?: ExecutionContext;
			context?: ExecutionContext;
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
