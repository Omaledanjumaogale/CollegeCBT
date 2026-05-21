import { writable } from 'svelte/store';
import { setContext, getContext } from 'svelte';

type TooltipState = {
	text: string;
	x: number;
	y: number;
	visible: boolean;
};

const TOOLTIP_CTX = 'tooltip';

export function createTooltipStore() {
	const { subscribe, set, update } = writable<TooltipState>({
		text: '',
		x: 0,
		y: 0,
		visible: false
	});
	setContext(TOOLTIP_CTX, { subscribe, set, update });
}

export function getTooltipStore() {
	return getContext<{ subscribe: typeof writable<TooltipState>['subscribe']; set: (v: TooltipState) => void; update: (fn: (v: TooltipState) => TooltipState) => void }>(TOOLTIP_CTX);
}
