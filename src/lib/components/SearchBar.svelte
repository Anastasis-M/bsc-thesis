<script lang="ts">
	import { popup, Autocomplete, getToastStore } from '@skeletonlabs/skeleton';
	import type { PopupSettings, AutocompleteOption, ToastSettings } from '@skeletonlabs/skeleton';
	import {
		total,
		paginatedCards,
		pageNum,
		sortBy,
		sortOrder,
		cards,
		searchTerm,
		location
	} from '$lib/stores';
	import { page } from '$app/stores';

	function debounce(func: Function, timeout: number) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(func, timeout);
	}

	async function getAutocompleteSuggestions(searchTerm: string): Promise<void> {
		let cardsType = 'all';
		if ($page.url.pathname === '/dashboard/favourites') {
			cardsType = 'favorites';
		}
		if (cachedResults[searchTerm]) {
			productOptions = cachedResults[searchTerm];
		} else {
			try {
				const res = await fetch(
					`http://localhost:5173/api/suggestions?suggestionsFor=${searchTerm}&type=products&cardsType=${cardsType}`
				);
				const returnedData = await res.json();
				if (!res.ok) {
					const toast: ToastSettings = {
						message: returnedData.error ?? 'Error getting suggestions',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				if (Array.isArray(returnedData.suggestions)) {
					productOptions = returnedData.suggestions.map((suggestion: string, index: number) => ({
						label: suggestion,
						value: index.toString()
					}));
					cachedResults[searchTerm] = productOptions;
				} else {
					productOptions = [];
				}
			} catch (error) {
				console.error('Error fetching autocomplete suggestions:', error);
			}
		}
	}

	async function searchFor(searchTerm) {
		const res = await fetch(
			`http://localhost:5173/api/cards?search=${searchTerm}` +
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
				$location.y
		);
		const returnedData = await res.json();
		if (!res.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error when searching for products. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
	}

	async function onProductSelection(event: any): Promise<void> {
		$searchTerm = event.detail.label;
		$pageNum = 0;
		searchFor($searchTerm);
	}

	const toastStore = getToastStore();

	let searchTimeout: number;

	$: {
		debounce(() => {
			getAutocompleteSuggestions($searchTerm);
		}, 800);
	}

	let productOptions: AutocompleteOption[] = [];
	let cachedResults: { [key: string]: any } = {};

	const popupFocusClick: PopupSettings = {
		event: 'focus-click',
		target: 'popupFocusClick',
		placement: 'bottom',
		middleware: {
			offset: 12
		}
	};
</script>

<div class="flex-grow flex items-center justify-center searchfix mx-2">
	<div
		class="relative max-searchbar-width w-full transition-all ease-in-out duration-300 rounded-4xl bg-surface-100-800-token h-full shadow-xl"
	>
		<div class=" absolute left-0 grid place-items-center h-full w-12">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
		<form class="justify-self-start w-full h-full rounded-4xl">
			<input
				bind:value={$searchTerm}
				use:popup={popupFocusClick}
				type="text"
				class="pl-10 w-full h-full rounded-4xl outline-none bg-transparent flex items-center cursor-text border-none focus:ring-0 focus:outline-none"
				placeholder="Search..."
				on:keydown={(event) => {
					if (event.key === 'Enter') {
						searchFor($searchTerm);
					}
				}}
			/>
		</form>
		<div
			class=" bg-surface-100-800-token border border-surface-300-600-token rounded-4xl w-full justify-center items-center animate-fade-in-down hidden z-50 shadow-xl"
			data-popup="popupFocusClick"
		>
			<Autocomplete
				options={productOptions}
				on:selection={onProductSelection}
				class="w-full overflow-x-scroll p-2 rounded-4xl z-100"
				bind:input={$searchTerm}
			/>
		</div>
	</div>
</div>


<style>
	.max-searchbar-width {
		max-width: 500px;
	}
	.searchfix{
		height: 43px;
	}
</style>