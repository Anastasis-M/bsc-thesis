<script lang="ts">
	import MostPopularIcon from '~icons/solar/bolt-circle-outline';
	import TechnologyIcon from '~icons/material-symbols/laptop-mac-outline';
	import HomeGardenIcon from '~icons/material-symbols/home-outline-rounded';
	import FashionIcon from '~icons/ic/outline-shopping-basket';
	import OfficeIcon from '~icons/mingcute/necktie-line';
	import LogoutIcon from '~icons/uil/sign-in-alt';
	import UploadIcon from '~icons/solar/upload-minimalistic-linear';
	import MyReviewsIcon from '~icons/ci/suitcase';
	import FavoritesIcon from '~icons/material-symbols/favorite-outline-rounded';
	import AccountIcon from '~icons/ph/user-bold';
	import { onMount } from 'svelte';
	import {
		user,
		categorizationOptions,
		total,
		paginatedCards,
		pageNum,
		sortBy,
		sortOrder,
		cards,
		searchTerm,
		storeId,
		reviewRefreshState,
		favoritesRefreshState,
		location
	} from '$lib/stores';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	export let margin = 'mx-2';
	export let padding = 'pb-2';
	export let appearance = 'hidden sm:flex';
	export let intent = 'normal';

	let storePage = 0;
	let stores = [];
	let storesTotal;

	onMount(async () => {
		scrollToTop();
		const res = await fetch('http://localhost:5173/api/stores?page=' + storePage);
		const storeData = await res.json();
		if (!res.ok) {
			const toast: ToastSettings = {
				message: storeData.error ?? 'Error retrieving stores. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		stores = storeData.stores;
		storesTotal = storeData.total;
	});

	function uploadReview() {
		if (!$user) {
			modalStore.trigger(loginModal);
			return;
		}
		modalStore.trigger(uploadReviewModal);
	}

	async function showCategory(option) {
		$searchTerm = '';
		$pageNum = 0;
		switch (option.name) {
			case 'All products':
				$categorizationOptions.forEach((o) => (o.enabled = false));
				$categorizationOptions[0].enabled = true;
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
				$total = returnedData.total;
				$paginatedCards = returnedData.paginatedCards;
				break;
			case 'Technology':
				$categorizationOptions.forEach((o) => (o.enabled = false));
				$categorizationOptions[1].enabled = true;
				$cards = 'technology';
				const res2 = await fetch(
					'http://localhost:5173/api/cards?' +
						'cards=' +
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
						$location.y
				);
				const returnedData2 = await res2.json();
				if (!res2.ok) {
					const toast: ToastSettings = {
						message: returnedData2.error ?? 'Error retrieving products. Please try again later.',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				$total = returnedData2.total;
				$paginatedCards = returnedData2.paginatedCards;
				break;
			case 'Home-Garden':
				$categorizationOptions.forEach((o) => (o.enabled = false));
				$categorizationOptions[2].enabled = true;
				$cards = 'home-garden';
				const res3 = await fetch(
					'http://localhost:5173/api/cards?' +
						'cards=' +
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
						$location.y
				);
				const returnedData3 = await res3.json();
				if (!res3.ok) {
					const toast: ToastSettings = {
						message: returnedData3.error ?? 'Error retrieving products. Please try again later.',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				$total = returnedData3.total;
				$paginatedCards = returnedData3.paginatedCards;
				break;
			case 'Fashion':
				$categorizationOptions.forEach((o) => (o.enabled = false));
				$categorizationOptions[3].enabled = true;
				$cards = 'fashion';
				const res4 = await fetch(
					'http://localhost:5173/api/cards?' +
						'cards=' +
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
						$location.y
				);
				const returnedData4 = await res4.json();
				if (!res4.ok) {
					const toast: ToastSettings = {
						message: returnedData4.error ?? 'Error retrieving products. Please try again later.',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				$total = returnedData4.total;
				$paginatedCards = returnedData4.paginatedCards;
				break;
			case 'Office':
				$categorizationOptions.forEach((o) => (o.enabled = false));
				$categorizationOptions[4].enabled = true;
				$cards = 'office';
				const res5 = await fetch(
					'http://localhost:5173/api/cards?' +
						'cards=' +
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
						$location.y
				);
				const returnedData5 = await res5.json();
				if (!res5.ok) {
					const toast: ToastSettings = {
						message: returnedData5.error ?? 'Error retrieving products. Please try again later.',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				$total = returnedData5.total;
				$paginatedCards = returnedData5.paginatedCards;
				break;
		}
	}

	const modalStore = getModalStore();

	const uploadReviewModal: ModalSettings = {
		component: 'uploadReviewModal',
		type: 'component',
		body: 'Share your experience for a product you bought!',
		title: 'Upload your review'
	};

	const loginModal: ModalSettings = {
		component: 'loginModal',
		type: 'component',
		body: 'Login to upload your reviews and explore rated products!',
		title: 'Login'
	};

	let sidebarTitle;
	let path;
	$: {
		path = $page.url.pathname;
	}

	let scrollContainer;
	function scrollToTop() {
		scrollContainer.scrollTo({ top: 0 });
	}

	const toastStore = getToastStore();

	const sidebarOptionsHome = [
		{
			name: 'All products',
			icon: MostPopularIcon
		},
		{
			name: 'Technology',
			icon: TechnologyIcon
		},
		{
			name: 'Home-Garden',
			icon: HomeGardenIcon
		},
		{
			name: 'Fashion',
			icon: FashionIcon
		},
		{
			name: 'Office',
			icon: OfficeIcon
		}
	];

	const sidebarOptionsDashboard = [
		{
			name: ' My reviews',
			icon: MyReviewsIcon,
			url: '/dashboard/myreviews'
		},
		{
			name: 'Favorites',
			icon: FavoritesIcon,
			url: '/dashboard/favourites'
		},
		{
			name: 'Account',
			icon: AccountIcon,
			url: '/dashboard/account'
		}
	];
	$: {
		if (path.includes('dashboard') && intent) {
			sidebarTitle = 'Dashboard';
			if (intent === 'drawer') {
				appearance = 'flex';
			} else {
				appearance = 'hidden sm:flex';
			}
		} else if (path === '/' && intent) {
			sidebarTitle = 'Categories';
			if (intent === 'drawer') {
				appearance = 'flex';
				intent = '';
			} else {
				appearance = 'hidden sm:flex';
			}
		} else {
			appearance = 'hidden';
		}
	}

	async function loadProductsFromStore(storeName) {
		const res = await fetch(
			'http://localhost:5173/api/cards?' +
				'cards=' +
				$cards +
				'&storeId=' +
				$storeId +
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
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
	}

	async function loadMoreStores() {
		if (stores.length >= storesTotal) return;
		storePage++;
		const storeData = await fetch('http://localhost:5173/api/stores?page=' + storePage);
		const storeDataJson = await storeData.json();
		if (!storeData.ok) {
			const toast: ToastSettings = {
				message: storeDataJson.error ?? 'Error retrieving stores. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		stores = [...stores, ...storeDataJson.stores];
	}

	async function reloadData(option) {
		switch (option) {
			case 'My reviews':
				$reviewRefreshState = true;
				break;
			case 'Favorites':
				$favoritesRefreshState = true;
				break;
			default:
				break;
		}
	}
</script>

<div class="{margin} {padding} h-full {appearance} w-56">
	<div
		bind:this={scrollContainer}
		class="flex flex-col justify-between p-2 variant-ghost-surface rounded-4xl overflow-scroll w-full"
	>
		<div class="flex flex-col">
			<span class="text-3xl font-semibold text-center mt-4 mb-6 text-shadow text-white"> {sidebarTitle}</span>

			{#if path === '/'}
				{#each sidebarOptionsHome as option (option)}
					{#if option.name.toLowerCase() !== $cards}
						<button
							on:click={() => showCategory(option)}
							class="btn btn-md variant-filled-surface mb-2 py-4 cursor-pointer justify-start shadow-xl"
						>
							{#if option.icon}
								<svelte:component this={option.icon} class="ml-2 mr-0.5" />
							{/if}
							{option.name}
						</button>
					{:else}
						<button
							on:click={() => showCategory(option)}
							class="btn btn-md variant-filled-tertiary mb-2 py-4 cursor-pointer justify-start shadow-xl"
						>
							{#if option.icon}
								<svelte:component this={option.icon} class="ml-2 mr-0.5" />
							{/if}
							{option.name}
						</button>
					{/if}
				{/each}
				<span class=" ml-7 mt-2 mb-2">Stores</span>
				<div class="max-h-32 overflow-scroll flex flex-col pt-2">
					{#each stores as store}
						<button
							on:click={async () => {
								$cards = 'store';
								$storeId = store.id;
								loadProductsFromStore(store.name);
							}}
							class="btn btn-sm variant-filled-surface mb-2 ml-7 cursor-pointer"
						>
							{store.name}
						</button>
					{/each}
				</div>
				<div class=" w-full flex items-center justify-end mb-2">
					{#if stores.length < storesTotal}
						<button
							on:click={async () => {
								loadMoreStores();
							}}
							disabled={stores.length >= storesTotal}>See more</button
						>
					{/if}
				</div>
			{:else}
				{#each sidebarOptionsDashboard as option (option)}
					{#if option.url === $page.url.pathname}
						<a
							href={option.url}
							class="btn btn-md variant-filled-tertiary mb-2 py-4 cursor-pointer justify-start shadow-xl"
							on:click={() => reloadData(option.name)}
						>
							{#if option.icon}
								<svelte:component this={option.icon} class="ml-2 mr-0.5" />
							{/if}
							{option.name}
						</a>
					{:else}
						<a
							href={option.url}
							class="btn btn-md variant-filled-surface mb-2 py-4 cursor-pointer justify-start shadow-xl"
							on:click={async () => await reloadData(option.name)}
						>
							{#if option.icon}
								<svelte:component this={option.icon} class="ml-2 mr-0.5" />
							{/if}
							{option.name}
						</a>
					{/if}
				{/each}
			{/if}
		</div>
		<div class="flex flex-col">
			{#if path === '/'}
				<button
					on:click={uploadReview}
					class="btn btn-md variant-filled-primary mb-2 py-4 cursor-pointer justify-start shadow-xl"
				>
					<UploadIcon class="ml-2 mr-0.5" />
					Upload your review
				</button>
			{/if}
			{#if $user}
				<a
					href="/logout"
					data-sveltekit-preload-data="tap"
					on:click={() => {
						$user = null;
						$cards = 'all products';
					}}
					class="btn btn-md variant-filled-surface mb-2 py-4 cursor-pointer justify-start"
				>
					<LogoutIcon class="ml-2 mr-0.5" />
					Log out
				</a>
			{/if}
		</div>
	</div>
</div>

<style>
	.text-shadow {
		text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
	}
</style>
