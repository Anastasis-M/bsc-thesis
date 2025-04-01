<script lang="ts">
	import ArrowLeft from '~icons/material-symbols/arrow-left-alt-rounded';
	import ArrowRight from '~icons/material-symbols/arrow-right-alt-rounded';
	import DotsIcon from '~icons/uil/draggabledots';
	import DotIcon from '~icons/ph/dot-bold';
	import EmptyHeartIcon from '~icons/ic/round-favorite-border';
	import FilledHeartIcon from '~icons/ic/outline-favorite';
	import EuroIcon from '~icons/clarity/euro-line';
	import AddIcon from '~icons/material-symbols/add-rounded';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { user, productRefreshState } from '$lib/stores';
	import { Splide, SplideSlide, SplideTrack } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css/splide-core.min.css';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { popup, getModalStore, Paginator, getToastStore } from '@skeletonlabs/skeleton';
	import type {
		PopupSettings,
		ModalSettings,
		PaginationSettings,
		ToastSettings
	} from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	async function onPageChange(e: CustomEvent): Promise<void> {
		pageNum = e.detail;
		const res = await fetch('http://localhost:5173/products/' + card.id + '?page=' + e.detail);
		const returnedData = await res.json();
		if (!res.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error getting product',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		total = returnedData.total;
		reviews = returnedData.paginatedReviews;
		card.is_favourite = returnedData.isFavourite;
		for (let i = 0; i < reviews.length; i++) {
			const review = reviews[i];
			for (let j = 0; j < review.images.length; j++) {
				const image = review.images[j];

				if (!imagePaths.includes(image)) {
					imagePaths = [...imagePaths, image];
				}
			}
		}
	}

	function uploadReview() {
		if (!$user) {
			modalStore.trigger(loginModal);
			return;
		}
		uploadReviewModal.meta = {
			product_name: card.product_name,
			price: card.average_price,
			rating: card.average_rating,
			category: card.category_id,
			store: card.store_name,
			store_id: card.store_maps_id
		};
		modalStore.trigger(uploadReviewModal);
	}

	function getInitials(name: string): string {
		if (!name) {
			return 'U';
		}
		return name
			.split(' ')
			.map((n) => n[0])
			.join('');
	}

	export let card;
	export let is_favourite;
	$: is_favourite = card.is_favourite;

	let imagePaths = [];

	card.reviews.forEach((review) => {
		review.images.forEach((image) => {
			imagePaths.push(image);
		});
	});

	let reviews = card.reviews;

	const modalStore = getModalStore();

	let reviewModal: ModalSettings = {
		component: 'reviewMainCardModal',
		type: 'component',
		body: 'This product is great!',
		meta: {
			username: 'John Doe',
			initials: 'JD',
			reviews: 10,
			score: '30'
		}
	};

	let uploadReviewModal: ModalSettings = {
		component: 'uploadReviewModal',
		type: 'component',
		body: 'Share your own experience for this product!',
		title: 'Add your Review'
	};

	let pageNum = 0;
	let total = card.totalReviews;
	let paginationSettings = {
		page: pageNum,
		limit: 2,
		size: total,
		amounts: [1, 2, 5, 10]
	} satisfies PaginationSettings;

	$: {
		paginationSettings.size = total;
		paginationSettings.page = pageNum;
	}

	let loginModal: ModalSettings = {
		component: 'loginModal',
		type: 'component',
		body: 'Login to upload your reviews and explore rated products!',
		title: 'Login'
	};

	const toastStore = getToastStore();

	$: {
		if ($productRefreshState) {
			(async () => {
				const res = await fetch('http://localhost:5173/products/' + card.id + '?page=' + pageNum);
				const returnedData = await res.json();
				if (!res.ok) {
					const toast: ToastSettings = {
						message: returnedData.error ?? 'Error getting product',
						background: 'variant-filled-error'
					};
					toastStore.trigger(toast);
				}
				total = returnedData.total;
				reviews = returnedData.paginatedReviews;
				card.is_favourite = returnedData.isFavourite;
				for (let i = 0; i < reviews.length; i++) {
					const review = reviews[i];
					for (let j = 0; j < review.images.length; j++) {
						const image = review.images[j];
						if (!imagePaths.includes(image)) {
							imagePaths.push(image);
						}
					}
				}
				productRefreshState.set(false);
			})();
		}
	}

	const infoPopup: PopupSettings = {
		event: 'click',
		target: 'infoPopup',
		placement: 'bottom'
	};

	let windowWidth;

	onMount(() => {
		windowWidth = window.innerWidth;
		if (windowWidth < 768) {
			carouselPaneAPI.resize(40);
			reviewsPaneAPI.resize(60);
		} else {
			carouselPaneAPI.resize(66);
			reviewsPaneAPI.resize(33);
		}
		window.addEventListener('resize', () => {
			setTimeout(() => {
				windowWidth = window.innerWidth;
			}, 1000);
		});
	});

	let carouselPaneAPI;
	let reviewsPaneAPI;
</script>

<div class="flex flex-col h-full w-full variant-ghost-surface rounded-4xl">
	<div
		class="flex items-center justify-between p-4 variant-ghost-surface rounded-t-4xl h-16 sm:h-20 shrink-0"
	>
		<form method="post" action="?/likeProduct" use:enhance class="btn-icon btn-icon-md">
			<input type="hidden" name="cardId" value={card.id} />
			{#if $user}
				<button
					type="submit"
					class="btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer w-full h-full transition-all duration-0 shadow-xl buttonfix !m-0"
					on:click={async () => {
						is_favourite = !is_favourite;
					}}
				>
					{#if is_favourite}
						<FilledHeartIcon class="w-6 h-6" />
					{:else}
						<EmptyHeartIcon class="w-6 h-6" />
					{/if}
				</button>
			{:else}
				<button
					type="button"
					class="btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer w-full transition-all duration-0 shadow-xl buttonfix !m-0"
					on:click={() => {
						loginModal.meta = {
							card_id: card.id
						};
						modalStore.trigger(loginModal);
					}}
				>
					<EmptyHeartIcon class="w-6 h-6" />
				</button>
			{/if}
		</form>

		<div class="flex h-10 cursor-pointer" use:popup={infoPopup}>
			<span class="text-3xl font-semibold mr-2 text-white text-shadow">{card.product_name} </span>
			<div class="flex self-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mr-2 icon-shadow" viewBox="0 0 24 24"
					><path
						fill="#ffff"
						d="m12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72l3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41l-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18l-1.1 4.72c-.2.86.73 1.54 1.49 1.08z"
					/></svg
				>
				<span class="flex items-center text-2xl text-white text-shadow">
					({card.average_rating})
				</span>
			</div>
		</div>
		<div
			data-popup="infoPopup"
			class="bg-surface-100-800-token rounded-4xl p-2 z-50 border border-surface-300-600-token shadow-xl"
		>
			<div class="flex items-center">
				<DotIcon />
				<div class="w-64 truncate">
					<span class="sm:text-2xl">{card.store_name}</span>
				</div>
			</div>

			<div class="flex items-center">
				<DotIcon />
				<span class="flex items-center sm:text-2xl mr-2">{card.average_price}</span>
				<EuroIcon class="w-6 h-6 self-center" />
			</div>
			<div class="arrow bg-surface-100-800-token" />
		</div>
		<button
			on:click={uploadReview}
			class="btn-icon btn-md variant-filled-primary cursor-pointer shadow-xl"
		>
			<AddIcon class="w-6 h-6" />
		</button>
	</div>
	<div class="flex w-full overflow-y-auto h-full">
		<PaneGroup direction={windowWidth < 768 ? 'vertical' : 'horizontal'}>
			<Pane
				class="flex flex-col py-4 px-2 border-b border-r-0 md:border-r md:border-b-0 border-surface-500"
				defaultSize={66}
				bind:pane={carouselPaneAPI}
			>
				<div
					class="card p-4 rounded-4xl h-full border border-surface-400-500-token bg-surface-100-800-token shadow-xl"
				>
					<Splide
						hasTrack={false}
						aria-label="Product Images"
						class="h-full relative"
					>
						<div
							class="splide__arrows absolute z-10 w-full flex justify-between top-1/2 transform -translate-y-1/2 px-2"
						>
							<button
								class="btn-icon btn-icon-md variant-filled-surface shadow-xl cursor-pointer splide__arrow splide__arrow--prev buttonfix left-1"
							>
								<ArrowLeft class="mt-0.5 w-6 h-6" />
							</button>
							<button
								class="btn-icon btn-icon-md variant-filled-surface shadow-xl cursor-pointer splide__arrow splide__arrow--next buttonfix right-1"
							>
								<ArrowRight class="mt-0.5 w-6 h-6" />
							</button>
						</div>
						<SplideTrack class="flex justify-center h-full">
							{#each imagePaths as imagePath}
								<SplideSlide class="flex justify-center">
									<img
										src="/review_images/{imagePath}"
										alt="Product"
										loading="lazy"
										class="object-contain"
									/>
								</SplideSlide>
							{/each}
						</SplideTrack>
					</Splide>
				</div>
			</Pane>
			<PaneResizer
				class="relative flex h-2 md:h-full md:w-2 my-4 md:my-0 bg-red-900 md:mx-4 items-center justify-center bg-surface-100-800-token"
			>
				<div
					class="p-1 bg-surface-100-800-token rounded-full shadow-xl border border-surface-400-500-token hover:border-primary-500"
				>
					<DotsIcon class=" text-shadow  rotate-90 md:rotate-0" />
				</div>
			</PaneResizer>
			<Pane class="flex flex-col overflow-y-scroll " defaultSize={33} bind:pane={reviewsPaneAPI}>
				<div class="w-full flex flex-col h-full">
					<div
						class="overflow-y-auto grow border-t border-l-0 md:border-t-0 md:border-l border-surface-500"
					>
						<div class="h-full px-2 pt-4">
							{#each reviews as review}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<div
									class="group flex justify-between bg-surface-100-800-token p-2 rounded-4xl h-28 mb-2 border-2 border-surface-400-500-token cursor-pointer hover:border-primary-500 transition-all duration-300 ease-in-out shadow-xl"
									on:click={() => {
										reviewModal.body = review.review_text;
										reviewModal.meta = {
											review_id: review.id,
											username: review.user.display_name ?? 'No User',
											initials: getInitials(review.user.display_name ?? 'No User'),
											reviews: review.user.number_of_reviews,
											images: review.images,
											user_score: review.user.helpful_ratio,
											review_score: `${review.helpful_votes}/${review.total_votes}`,
											review_liked: review.liked ?? false,
											review_disliked: review.disliked ?? false
										};
										modalStore.trigger(reviewModal);
									}}
								>
									<div class="w-16 flex shrink-0 items-center justify-center h-full">
										<div class="buttonfix flex items-center justify-center">
											<Avatar
												src=""
												initials={getInitials(review.user.display_name ?? 'No User')}
												class=" group-hover:!border-primary-500 transition-all duration-300 ease-in-out"
												background="bg-surface-100-800-token"
												border="border-2 border-surface-300-600-token"
											/>
										</div>
									</div>
									<div class="grow line-clamp-4">
										{review.review_text}
									</div>
								</div>
							{/each}
						</div>
					</div>
					<div
						class="flex items-center justify-center p-4 h-16 sm:h-20 variant-ghost-surface rounded-br-4xl shrink-0"
					>
						<div>
							<Paginator
								bind:settings={paginationSettings}
								showFirstLastButtons={true}
								showPreviousNextButtons={true}
								justify="justify-center"
								class="!space-y-0"
								amountText="Products"
								controlVariant="bg-surface-100-800-token shadow-xl h-10"
								select="select rounded-4xl px-4 w-32 hidden"
								on:page={onPageChange}
							/>
						</div>
					</div>
				</div>
			</Pane>
		</PaneGroup>
	</div>
</div>

<style>
	.text-shadow {
		text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
	}
	.icon-shadow {
		filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.5));
	}

	.buttonfix {
		width: 43px;
		height: 43px;
	}
</style>
