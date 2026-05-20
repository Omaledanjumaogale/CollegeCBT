import { browser } from '$app/environment';
import { showToast } from '$lib/stores';

/**
 * Enterprise-grade Push Notification Manager.
 * Orchestrates VAPID subscription, permission gating, and service worker synchronization.
 */

import { convex } from '$lib/services/convexClient';
import { anyApi } from 'convex/server';

const VAPID_KEY = import.meta.env.PUBLIC_VAPID_PUBLIC_KEY || '';

export async function subscribeToPush(userId?: string) {
    if (!browser || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[PushManager] Navigation or PushManager not available.');
        return;
    }

    if (!VAPID_KEY) {
        console.warn('[PushManager] PUBLIC_VAPID_PUBLIC_KEY not configured. Skipping subscription.');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            // Register new subscription
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
            });
            
            showToast('🔔 Notifications Enabled', 'You will now receive real-time exam updates.', 'success');
            console.log('[PushManager] New subscription created:', subscription);
        } else {
            console.log('[PushManager] Active subscription found.');
        }

        // Synchronize with Convex backend if userId is logged in
        if (userId && subscription) {
            await convex.mutation(anyApi.notifications.saveSubscription, {
                userId,
                subscription: JSON.stringify(subscription)
            });
            console.log('[PushManager] Sync with Convex complete for user:', userId);
        }
        
        return subscription;
    } catch (error) {
        console.error('[PushManager] Subscription failed:', error);
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
