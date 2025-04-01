<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { superForm, filesProxy } from 'sveltekit-superforms/client';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import HalfStarIcon from '~icons/ic/round-star-half';
	import FullStarIcon from '~icons/material-symbols/star-rounded';
	import EmptyStarIcon from '~icons/ic/round-star-outline';
	import Xicon from '~icons/ph/x-circle-bold';
	import {
		ProgressRadial,
		getToastStore,
		Autocomplete,
		popup,
		Ratings
	} from '@skeletonlabs/skeleton';
	import type { ToastSettings, AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import {
		searchTerm,
		cards,
		pageNum,
		sortBy,
		sortOrder,
		location,
		storeId,
		total,
		paginatedCards
	} from '$lib/stores';
	let productSearchTerm: string;
	let storeSearchTerm: string;
	import '@splidejs/svelte-splide/css/splide-core.min.css';

	export let parent: any;
	const modalStore = getModalStore();
	const {
		form: uploadReviewForm,
		errors: uploadReviewErrors,
		enhance: uploadReviewEnhance,
		message: uploadReviewMessage,
		constraints: uploadReviewConstraints,
		delayed: uploadReviewDelayed
	} = superForm($page.data.uploadReviewForm, {
		resetForm: true,
		delayMs: 500,
		timeoutMs: 1500,
	});

	$: if (files) {
		$uploadReviewForm.reviewImages = files;
	}

	let files = filesProxy(uploadReviewForm, 'reviewImages');
	let showImage = true;
	let container;
	let imagePreview = [];
	let showContainer = 'hidden';

	async function onChangeHandler(e: Event): Promise<void> {
		const files = Array.from($uploadReviewForm.reviewImages);
		imagePreview = [];
		for (const file of files) {
			if (file) {
				showContainer = 'flex';
				const reader = new FileReader();
				const onLoadPromise = new Promise((resolve) => {
					reader.onload = () => {
						imagePreview = [...imagePreview, { name: file.name, src: reader.result as string }];
						resolve(null);
					};
				});
				reader.readAsDataURL(file);
				await onLoadPromise;
			}
		}
		showImage = false;
	}

	let value = { current: 0, max: 5 };
	function iconClick(event: CustomEvent<{ index: number }>): void {
		value.current = event.detail.index;
		$uploadReviewForm.rating = value.current;
	}

	let categoriesInput: string = '';
	let selectedCategory: number = 0;
	const categoriesOptions: AutocompleteOption[] = [
		{ label: 'Technology', value: '1' },
		{ label: 'Home - Garden', value: '2' },
		{ label: 'Fashion', value: '3' },
		{ label: 'Office', value: '4' }
	];

	function onCategoriesSelect(event: any): void {
		categoriesInput = event.detail.label;
		selectedCategory = event.detail.value;
		$uploadReviewForm.category = selectedCategory;
	}

	const categoriesPopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'categoriesPopupAutocomplete',
		placement: 'bottom',
		middleware: {
			offset: 12
		}
	};

	let productOptions: AutocompleteOption[] = [];
	let cachedResults: { [key: string]: any } = {};
	let locationString: string = '';

	$: {
		locationString = $location.x + ',' + $location.y || '';
		$uploadReviewForm.location = locationString;
	}

	const toastStore = getToastStore();

	async function getAutocompleteSuggestions(searchTerm: string, type: string): Promise<void> {
		if (cachedResults[searchTerm]) {
			productOptions = cachedResults[searchTerm];
		} else {
			try {
				const res = await fetch(
					`http://localhost:5173/api/suggestions?suggestionsFor=${searchTerm}&type=${type}&location=${locationString}`
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
					if (type == 'products') {
						productOptions = returnedData.suggestions.map((suggestion: string, index: number) => ({
							label: suggestion,
							value: index.toString()
						}));
						// Cache the results
						cachedResults[searchTerm] = productOptions;
					} else if (type == 'stores') {
						storeOptions = returnedData.suggestions
							.map((suggestion: object, index: number) => ({
								label: suggestion.store_name,
								value: index.toString(),
								meta: { store_id: suggestion.store_id }
							}))
							.filter((option) => option.label != null);
						// Cache the results
						cachedResults2[searchTerm] = storeOptions;
					}
				} else {
					productOptions = [];
					storeOptions = [];
				}
			} catch (error) {
				console.error('Error fetching autocomplete suggestions:', error);
			}
		}
	}

	async function onProductSelection(event: any): Promise<void> {
		$uploadReviewForm.productName = event.detail.label;
		productSearchTerm = event.detail.label;
	}

	const productsPopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'productsPopupAutocomplete',
		placement: 'bottom',
		middleware: {
			offset: 12
		}
	};

	$: {
		debounce(() => {
			$uploadReviewForm.productName = productSearchTerm;
			getAutocompleteSuggestions(productSearchTerm, 'products');
		}, 800);
	}
	let searchTimeout: number;
	function debounce(func: Function, timeout: number) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(func, timeout);
	}

	let storeOptions: AutocompleteOption[] = [];
	let cachedResults2: { [key: string]: any } = {};

	async function onStoreSelection(event: any): Promise<void> {
		$uploadReviewForm.store = event.detail.label;
		$uploadReviewForm.storeId = event.detail.meta.store_id;
		storeSearchTerm = event.detail.label;
	}

	const storesPopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'storesPopupAutocomplete',
		placement: 'bottom',
		middleware: {
			offset: 12
		}
	};

	$: {
		debounce(() => {
			getAutocompleteSuggestions(storeSearchTerm, 'stores');
		}, 800);
	}

	$uploadReviewForm.productName = $modalStore[0]?.meta?.product_name ?? '';
	productSearchTerm = $modalStore[0]?.meta?.product_name ?? '';
	$uploadReviewForm.category = $modalStore[0]?.meta?.category ?? '';
	selectedCategory = $modalStore[0]?.meta?.category ?? 0;
	categoriesInput =
		categoriesOptions.find((option) => parseInt(option.value) === $modalStore[0]?.meta?.category)
			?.label ?? '';

	$uploadReviewForm.store = $modalStore[0]?.meta?.store ?? '';
	storeSearchTerm = $modalStore[0]?.meta?.store ?? '';
	$uploadReviewForm.storeId = $modalStore[0]?.meta?.store_id ?? '';

	async function fetchCards() {
		const res = await fetch(
			'http://localhost:5173/api/cards?' +
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
		const returnedData = await res.json();
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
	}

	$: {
		if ($uploadReviewMessage === 'Review uploaded!') {
			(async () => {
				await fetchCards();
			})();
			const toast: ToastSettings = {
				message: $uploadReviewMessage,
				background: 'variant-filled-success'
			};
			toastStore.trigger(toast);
			parent.onClose();
		}
	}
</script>

{#if $modalStore[0]}
	<div class="card p-4 w-modal shadow-xl space-y-4 rounded-4xl h-fit">
		<header class="text-2xl font-bold flex justify-center">
			{$modalStore[0].title ?? '(title missing)'}
		</header>
		<article class="flex justify-center">
			{$modalStore[0].body ?? 'Share your experience for a product you bought!'}
		</article>
		<form
			method="POST"
			action="?/uploadReview"
			use:uploadReviewEnhance
			enctype="multipart/form-data"
			autocomplete="off"
		>
			<div class="modal-form border border-surface-500 p-4 space-y-4 rounded-4xl">
				<div class="flex flex-col sm:flex-row">
					<label class="label flex flex-col sm:w-1/2 mb-2 sm:mb-0" for="rating">
						<span>Product name:</span>
						<div class="flex flex-col mr-1.5 relative">
							<input
								name="products-search"
								class="input"
								type="text"
								placeholder="Add new..."
								bind:value={productSearchTerm}
								use:popup={productsPopupSettings}
								disabled={$modalStore[0].meta?.product_name}
							/>
							<div
								data-popup="productsPopupAutocomplete"
								class="variant-filled-surface p-2 rounded-4xl shadow-xl absolute z-50 w-full"
							>
								<Autocomplete
									bind:input={$uploadReviewForm.productName}
									options={productOptions}
									on:selection={onProductSelection}
								/>
								<input
									name="productName"
									class="hidden"
									type="text"
									bind:value={$uploadReviewForm.productName}
								/>
							</div>
							{#if $uploadReviewErrors.productName}<span class="invalid text-red-500"
									>{$uploadReviewErrors.productName}!</span
								>{/if}
						</div>
					</label>
					<label class="label flex flex-col sm:w-1/2" for="category">
						<span>Category:</span>
						<div class="flex flex-col mr-1.5 relative">
							<input
								class="input autocomplete"
								type="search"
								name="categories-search"
								bind:value={categoriesInput}
								placeholder="Search..."
								use:popup={categoriesPopupSettings}
								disabled={$modalStore[0].meta?.category}
							/>
							<div
								data-popup="categoriesPopupAutocomplete"
								class="variant-filled-surface p-2 rounded-4xl shadow-xl absolute z-50 w-full"
							>
								<Autocomplete
									bind:input={categoriesInput}
									options={categoriesOptions}
									on:selection={onCategoriesSelect}
								/>
								<input
									name="category"
									class="hidden"
									type="text"
									bind:value={selectedCategory}
									{...$uploadReviewConstraints.category}
								/>
							</div>
							{#if $uploadReviewErrors.category}<span class="invalid text-red-500"
									>{$uploadReviewErrors.category}!</span
								>{/if}
						</div>
					</label>
				</div>
				<div class="flex flex-col sm:flex-row">
					<label class="label flex flex-col sm:w-1/2 mb-2 sm:mb-0" for="store">
						<span>Store:</span>
						<div class="flex flex-col mr-1.5 relative">
							<input
								name="store-search"
								class="input"
								type="text"
								placeholder="Search..."
								bind:value={storeSearchTerm}
								use:popup={storesPopupSettings}
								disabled={$modalStore[0].meta?.store}
							/>
							<div
								data-popup="storesPopupAutocomplete"
								class="variant-filled-surface p-2 rounded-4xl shadow-xl absolute z-50 w-full"
							>
								<Autocomplete
									bind:input={$uploadReviewForm.store}
									options={storeOptions}
									on:selection={onStoreSelection}
								/>
								<input
									name="store"
									class="hidden"
									type="text"
									bind:value={$uploadReviewForm.store}
								/>
								<input
									name="storeId"
									class="hidden"
									type="text"
									bind:value={$uploadReviewForm.storeId}
								/>
							</div>
							{#if $uploadReviewErrors.storeId}<span class="invalid text-red-500"
									>{$uploadReviewErrors.storeId}!</span
								>{/if}
						</div>
					</label>
					<label class="label flex flex-col sm:w-1/2 mb-2 sm:mb-0 mr-1.5" for="price">
						<span>Price:</span>
						<div class="flex flex-col">
							<input
								name="price"
								class="input"
								type="text"
								placeholder="ex. 5"
								aria-invalid={$uploadReviewErrors.price ? 'true' : undefined}
								bind:value={$uploadReviewForm.price}
								{...$uploadReviewConstraints.price}
							/>
							{#if $uploadReviewErrors.price}<span class="invalid text-red-500"
									>{$uploadReviewErrors.price}!</span
								>{/if}
						</div>
					</label>
				</div>

				<div class="flex">
					<label class="label flex flex-col" for="rating">
						<span>Your rating:</span>
						<div class="flex flex-col mr-1.5">
							<input
								name="rating"
								class="hidden"
								type="text"
								bind:value={value.current}
								{...$uploadReviewConstraints.rating}
							/>
							<Ratings bind:value={value.current} max={value.max} interactive on:icon={iconClick}>
								<svelte:fragment slot="empty">
									<EmptyStarIcon class="w-6 h-6 " />
								</svelte:fragment>
								<svelte:fragment slot="half">
									<HalfStarIcon class="w-6 h-6 " />
								</svelte:fragment>
								<svelte:fragment slot="full">
									<FullStarIcon class="w-6 h-6" />
								</svelte:fragment>
							</Ratings>

							{#if $uploadReviewErrors.rating}<span class="invalid text-red-500"
									>{$uploadReviewErrors.rating}!</span
								>{/if}
						</div>
					</label>
				</div>

				<label for="reviewText" class="label"
					><span>Write your review here:</span><textarea
						id="reviewText"
						name="reviewText"
						rows="4"
						class="textarea"
						placeholder="Write your thoughts here..."
						bind:value={$uploadReviewForm.reviewText}
						{...$uploadReviewConstraints.reviewText}
					/></label
				>

				{#if $uploadReviewErrors.reviewText}<span class="invalid text-red-500"
						>{$uploadReviewErrors.reviewText}!</span
					>{/if}

				<FileDropzone
					name="reviewImages"
					multiple
					accept="image/*"
					bind:files={$files}
					on:change={onChangeHandler}
				/>

				{#if $uploadReviewErrors.reviewImages}
					{#each $uploadReviewErrors.reviewImages._errors as error}
						<span class="invalid text-red-500">{error}</span>
					{/each}
				{/if}

				<div
					bind:this={container}
					class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 {showContainer} "
				>
					{#each imagePreview as image}
						<div
							class="snap-start shrink-0 card w-40 py-4 px-2 text-center rounded-4xl h-40 flex justify-center items-center relative"
						>
							<button
								on:click={() => {
									$uploadReviewForm.reviewImages = $uploadReviewForm.reviewImages.filter(
										(i) => i.name != image.name
									);
									imagePreview = imagePreview.filter((i) => i != image);
									$files = $uploadReviewForm.reviewImages;
									if (imagePreview.length == 0) {
										showContainer = 'hidden';
									}
								}}
								type="button"
								class="btn-icon variant-filled absolute focus:!ring-0 focus:!outline-none !outline-none shadow-xl"
								><Xicon class="text-black" /></button
							>
							<img src={image.src} alt="Preview" class="object-contain h-full" />
						</div>
					{/each}
				</div>

				{#if $uploadReviewMessage == 'Review uploaded!'}
					<div class="text-green-500 text-sm">{$uploadReviewMessage}</div>
				{:else if $uploadReviewMessage}
					<div class="text-red-500 text-sm">{$uploadReviewMessage}</div>
				{/if}
				{#if $uploadReviewDelayed}<ProgressRadial class="mx-auto h-8 w-8" />
				{/if}
			</div>

			<input type="hidden" name="location" bind:value={$uploadReviewForm.location} />

			<footer class="modal-footer flex justify-center mt-4 {parent.regionFooter}">
				<button
					type="button"
					class="btn {parent.buttonNeutral} focus:!ring-0 focus:!outline-none !outline-none border border-surface-500"
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
				<button
					class="btn {parent.buttonPositive} focus:!ring-0 focus:!outline-none !outline-none"
					type="submit">Upload</button
				>
			</footer>
		</form>
	</div>
{/if}
