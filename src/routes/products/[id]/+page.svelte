<script lang="ts">
	import ProductCardMain from '$lib/components/ProductCardMain.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { productRefreshState } from '$lib/stores';

	import { page } from '$app/stores';

	let card = $page.data.card;

	/** @type {import('./$types').ActionData} */
	export let form;

	const toastStore = getToastStore();

	$: {
		if (form?.toast) {
			const toast: ToastSettings = {
				message: form.toast.message,
				background: form.toast.background
			};
			toastStore.trigger(toast);
			if (toast.message == 'Review liked or disliked!') {
				$productRefreshState = true;
			}
			form.toast = null;
		}
	}

	if (!card) {
		const toast: ToastSettings = {
			message: 'Error retrieving product data',
			background: 'variant-filled-error'
		};
		toastStore.trigger(toast);
	}
</script>

<div
	class="flex flex-col mb-2 rounded-4xl absolute top-20 sm:top-24 bottom-0 right-2 left-2 overflow-scroll"
>
	{#if card}
		<ProductCardMain {card} is_favourite={card.is_favourite} />
	{/if}
</div>
