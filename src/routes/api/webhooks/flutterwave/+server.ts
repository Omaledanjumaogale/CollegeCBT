import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const signature = request.headers.get('verif-hash');
		const env = platform?.env as Record<string, string> | undefined;
		const secretHash = env?.FLUTTERWAVE_WEBHOOK_HASH;

		// 1. Verify webhook signature
		if (secretHash && signature !== secretHash) {
			console.error('[CollegeCBT] Webhook signature mismatch');
			return json({ status: 'unauthorized' }, { status: 401 });
		}

		const data = await request.json();
		console.log('[CollegeCBT] Webhook received:', data.event, data.data.tx_ref);

		// 2. We only care about charge.completed
		if (data.event !== 'charge.completed' || data.data.status !== 'successful') {
			return json({ status: 'ignored' });
		}

		// 3. Extract UID from tx_ref (Format: CBT-UID-TIMESTAMP)
		const txRef = data.data.tx_ref as string;
		const parts = txRef.split('-');
		if (parts.length < 3 || parts[0] !== 'CBT') {
			console.error('[CollegeCBT] Invalid tx_ref format:', txRef);
			return json({ status: 'invalid_ref' }, { status: 400 });
		}
		
		const uid = parts[1];
		const amount = data.data.amount;

		// 4. Update Firestore user plan
		// Map amount to plan
		let newPlan: 'pro' | 'institutional' = 'pro';
		if (amount >= 20000) newPlan = 'institutional'; // ₦25,000 plan

		const projectId = env?.PUBLIC_FIREBASE_PROJECT_ID;
		const apiKey = env?.PUBLIC_FIREBASE_API_KEY;

		if (!projectId || !apiKey) {
			console.error('[CollegeCBT] Firebase config missing for webhook');
			return json({ status: 'config_error' }, { status: 500 });
		}

		// Use the Firestore REST API to patch the document (Edge-compatible)
		const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=plan&updateMask.fieldPaths=updatedAt&key=${apiKey}`;
		
		const updateRes = await fetch(firestoreUrl, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				fields: {
					plan: { stringValue: newPlan },
					updatedAt: { integerValue: Date.now().toString() }
				}
			})
		});

		if (!updateRes.ok) {
			const err = await updateRes.text();
			console.error('[CollegeCBT] Webhook Firestore update failed:', err);
			return json({ status: 'update_failed' }, { status: 500 });
		}

		console.log(`[CollegeCBT] User ${uid} upgraded to ${newPlan} via webhook`);
		return json({ status: 'success' });

	} catch (err) {
		console.error('[CollegeCBT] Webhook error:', err);
		return json({ status: 'error' }, { status: 500 });
	}
};
