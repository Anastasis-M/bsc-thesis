<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	export let parent: any;

	const modalStore = getModalStore();

	import { page } from '$app/stores';
	import {
		sortingOptions,
		total,
		paginatedCards,
		pageNum,
		sortBy,
		sortOrder,
		cards,
		searchTerm,
		location,
		storeId
	} from '$lib/stores';
	let url;
	$: {
		if ($page.url.pathname === '/dashboard/favourites') {
			url = '/dashboard/favourites';
		} else {
			url = '/api/cards';
		}
	}

	async function chooseFilter1(group) {
		group.sortOrder = '';
		$sortBy = '';
		$sortOrder = '';
		$pageNum = 0;
		const res = await fetch(
			'http://localhost:5173' +
				url +
				'?' +
				'search=' +
				$searchTerm +
				'&cards=' +
				$cards +
				'&page=' +
				$pageNum +
				'&sortBy=' +
				$sortBy +
				'&sortOrder=' +
				$sortOrder +
				'&location=' +
				$location.x +
				',' +
				$location.y +
				'&storeId=' +
				$storeId
		);
		parent.onClose();
		const returnedData = await res.json();
		if (!res.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error retrieving products. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
		$sortingOptions.forEach((g) => {
			if (g.sortOrder !== '' && g.name !== group.name) {
				g.sortOrder = '';
			}
		});
	}

	async function chooseFilter2(group, i) {
		if (i === 0) {
			group.sortOrder = 'asc';
			$sortOrder = 'asc';
		} else {
			group.sortOrder = 'desc';
			$sortOrder = 'desc';
		}
		$sortBy = group.name;
		$pageNum = 0;
		const res = await fetch(
			'http://localhost:5173' +
				url +
				'?' +
				'search=' +
				$searchTerm +
				'&cards=' +
				$cards +
				'&page=' +
				$pageNum +
				'&sortBy=' +
				$sortBy +
				'&sortOrder=' +
				$sortOrder +
				'&location=' +
				$location.x +
				',' +
				$location.y +
				'&storeId=' +
				$storeId
		);
		parent.onClose();
		const returnedData = await res.json();
		if (!res.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error retrieving products. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
		$sortingOptions.forEach((g) => {
			if (g.sortOrder !== '' && g.name !== group.name) {
				g.sortOrder = '';
			}
		});
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4 rounded-4xl">
		<header class="text-2xl font-bold flex justify-center items-center">
			{$modalStore[0].title ?? 'Sort by'}
		</header>
		<article class="flex justify-center">
			{$modalStore[0].body ?? 'Filter products to your liking!'}
		</article>
		<form
			class="modal-form border border-surface-500 p-4 py-8 rounded-4xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5"
		>
			{#each $sortingOptions as group}
				<span class="font-bold text-lg flex items-center">{group.name}:</span>

				{#each Array(2) as _, i}
					{#if (group.sortOrder === 'asc' && i === 0) || (group.sortOrder === 'desc' && i === 1)}
						<button
							class="rounded-4xl variant-filled-tertiary btn text-lg font-bold flex items-center cursor-pointer focus:!ring-0 focus:!outline-none !outline-none"
							on:click={async () => chooseFilter1(group)}
						>
							{#if group.name !== 'Alphabetical' && group.name !== 'Location' && i === 0}
								Ascending
							{:else if group.name === 'Alphabetical' && i === 0}
								A-Z
							{:else if group.name === 'Location' && i === 0}
								Closest to Farthest
							{:else if group.name === 'Location' && i === 1}
								Farthest to Closest
							{:else if group.name !== 'Alphabetical' && group.name !== 'Location' && i === 1}
								Descending
							{:else if group.name === 'Alphabetical' && i === 1}
								Z-A
							{/if}
						</button>
					{:else}
						<button
							class="rounded-4xl btn btn-md variant-filled-surface text-lg flex items-center cursor-pointer focus:!ring-0 focus:!outline-none !outline-none"
							on:click={async () => chooseFilter2(group, i)}
							disabled={group.name === 'Location' && $location.x == null && $location.y == null}
						>
							{#if group.name !== 'Alphabetical' && group.name !== 'Location' && i === 0}
								Ascending
							{:else if group.name === 'Alphabetical' && i === 0}
								A-Z
							{:else if group.name === 'Location' && i === 0}
								Closest to Farthest
							{:else if group.name === 'Location' && i === 1}
								Farthest to Closest
							{:else if group.name !== 'Alphabetical' && group.name !== 'Location' && i === 1}
								Descending
							{:else if group.name === 'Alphabetical' && i === 1}
								Z-A
							{/if}
						</button>
					{/if}
				{/each}
			{/each}
		</form>
	</div>
{/if}
