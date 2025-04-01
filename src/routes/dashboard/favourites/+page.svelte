<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { onMount } from 'svelte';
	import ExploreBar from '$lib/components/ExploreBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import {
		cards,
		paginatedCards,
		total,
		pageNum,
		sortBy,
		sortOrder,
		location,
		favoritesRefreshState
	} from '$lib/stores';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	let path;
	let changeIcon = false;
	$: {
		path = $page.url.pathname;
		if (path == '/dashboard/favourites') {
			changeIcon = true;
		}
	}

	/** @type {import('./$types').ActionData} */
	export let form;

	const toastStore = getToastStore();

	$paginatedCards = [];
	onMount(async () => {
		$pageNum = 0;
		$cards = 'favorites';
		const res = await fetch(
			'http://localhost:5173/dashboard/favourites?' +
				'&page=' +
				$pageNum +
				'&sortBy=' +
				$sortBy +
				'&sortOrder=' +
				$sortOrder +
				'&location=' +
				$location.x +
				',' +
				$location.y
		);

		const returnedData = await res.json();
		if (!res.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error retrieving products. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		$total = returnedData.total ?? 0;
		$paginatedCards = returnedData.paginatedCards ?? [];
	});

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

	$: {
		if ($favoritesRefreshState) {
			(async () => {
				const res = await fetch(
					'http://localhost:5173/dashboard/favourites?' +
						'&page=' +
						$pageNum +
						'&sortBy=' +
						$sortBy +
						'&sortOrder=' +
						$sortOrder +
						'&location=' +
						$location.x +
						',' +
						$location.y
				);
				const returnedData = await res.json();
				if (!res.ok) {
					const toast: ToastSettings = {
						message: returnedData.error ?? 'Error retrieving products. Please try again later.',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				$total = returnedData.total ?? 0;
				$paginatedCards = returnedData.paginatedCards ?? [];

				favoritesRefreshState.set(false);
			})();
		}
	}
</script>

<div
	class="flex flex-col variant-ghost-surface mb-2 rounded-4xl absolute top-20 sm:top-24 bottom-0 right-2 left-2 sm:left-60 overflow-hidden"
>
	<ExploreBar title="Favourites" />
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
						productImage={'../../review_images/' + product.image_cover_path}
						{changeIcon}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<span class="text-center text-2xl font-semibold grow flex justify-center"
			>No saved favourites!</span
		>
	{/if}
	<Footer />
</div>
