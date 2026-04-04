import { type FlyParams } from 'svelte/transition';

/**
 * Enterprise Global Reactive Toasts.
 * Strictly handles notification overlays with semantic accessibility.
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
	title: string;
	message: string;
	type?: NotificationType;
	duration?: number;
}

class NotificationManager {
	#toasts = $state<({ id: string } & NotificationOptions)[]>([]);

	get list() {
		return this.#toasts;
	}

	/**
	 * show: Displays a new notification tray item.
	 */
	show(options: NotificationOptions) {
		const id = Math.random().toString(36).substring(2, 9);
		const duration = options.duration ?? 5000;

		this.#toasts.push({
			id,
			...options,
			type: options.type ?? 'info'
		});

		if (duration > 0) {
			setTimeout(() => {
				this.dismiss(id);
			}, duration);
		}

		return id;
	}

	/**
	 * dismiss: Removes a notification by ID.
	 */
	dismiss(id: string) {
		this.#toasts = this.#toasts.filter((t) => t.id !== id);
	}

	// Semantic helpers with simpler language
	success(message: string, title = 'Done') {
		return this.show({ title, message, type: 'success' });
	}

	error(message: string, title = 'Error') {
		return this.show({ title, message, type: 'error' });
	}

	info(message: string, title = 'Notice') {
		return this.show({ title, message, type: 'info' });
	}

	warn(message: string, title = 'Warning') {
		return this.show({ title, message, type: 'warning' });
	}
}

export const notifications = new NotificationManager();
// Legacy alias for backward compatibility
export const toast = notifications;

