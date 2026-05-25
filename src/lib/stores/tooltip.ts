import { writable, type Writable } from 'svelte/store';
import { setContext, getContext } from 'svelte';

type TooltipState = {
	text: string;
	x: number;
	y: number;
	visible: boolean;
};

const TOOLTIP_CTX = 'tooltip';

export function createTooltipStore() {
	const store = writable<TooltipState>({
		text: '',
		x: 0,
		y: 0,
		visible: false
	});
	setContext(TOOLTIP_CTX, store);
	return store;
}

export function getTooltipStore() {
	return getContext<Writable<TooltipState>>(TOOLTIP_CTX);
}
