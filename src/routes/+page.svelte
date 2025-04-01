<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ExploreBar from '$lib/components/ExploreBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { paginatedCards, total, pageNum, sortBy, sortOrder, cards, location, user } from '$lib/stores';

	/** @type {import('./$types').ActionData} */
	export let form;

	onMount(async () => {
		$cards = 'all products';
		const res = await fetch(
			'http://localhost:5173/api/cards?' +
				'cards=' +
				$cards +
				'&page=' +
				$pageNum +
				'&sortBy=' +
				$sortBy +
				'&sortOrder=' +
				$sortOrder+
				'&location=' +
				$location.x +
				',' +
				$location.y
		);
		if (!res.ok) {
			const toast: ToastSettings = {
				message: 'Error retrieving products. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		const returnedData = await res.json();
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
	});

	const toastStore = getToastStore();

	$: {
		if (form?.toast) {
			const toast: ToastSettings = {
				message: form.toast.message,
				background: form.toast.background
			};
			toastStore.trigger(toast);
			form.toast = null;
		}
	}
</script>

<div
	class="flex flex-col variant-ghost-surface mb-2 rounded-4xl absolute top-20 sm:top-24 bottom-0 right-2 left-2 sm:left-60 overflow-hidden"
>
	<ExploreBar title="Explore" />
	{#if $paginatedCards.length > 0}
		<div class="@container overflow-x-hidden grow">
			<div
				class="grid justify-items-center grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 @8xl:grid-cols-6 gap-4 p-2 @sm:p-4 @7xl:p-3 @7xl:gap-3"
			>
				{#each $paginatedCards as product}
					<svelte:component
						this={ProductCard}
						{form}
						cardId={product.id}
						name={product.product_name}
						store={product.store_name}
						price={product.average_price}
						rating={product.average_rating}
						is_favourite={product.is_favourite ?? false}
						productImage={'review_images/' + product.image_cover_path}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<span class="text-center text-2xl font-semibold grow flex justify-center"
			>No products available!</span
		>
	{/if}
	<Footer />
</div>
