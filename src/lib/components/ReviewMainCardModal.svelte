<script lang="ts">
	import ArrowLeft from '~icons/material-symbols/arrow-left-alt-rounded';
	import ArrowRight from '~icons/material-symbols/arrow-right-alt-rounded';
	import ThumbsUp from '~icons/mingcute/thumb-up-2-line';
	import ThumbsDown from '~icons/mingcute/thumb-down-2-line';
	import ThumbsUpFilled from '~icons/mingcute/thumb-up-2-fill';
	import ThumbsDownFilled from '~icons/mingcute/thumb-down-2-fill';
	import DotIcon from '~icons/ph/dot-bold';
	import { enhance } from '$app/forms';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { popup, getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import { Splide, SplideSlide, SplideTrack } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css/splide-core.min.css';
	import type { PopupSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import { user, productRefreshState } from '$lib/stores';

	const modalStore = getModalStore();

	export let parent: any;

	const imagePaths = $modalStore[0].meta.images.map((image) => image);

	const userStatsDropdown: PopupSettings = {
		event: 'click',
		target: 'userStatsDropdown',
		placement: 'bottom',
		middleware: {
			offset: 16
		}
	};

	let likeSatus = false;
	let isLiked = $modalStore[0].meta.review_liked;
	let isDisliked = $modalStore[0].meta.review_disliked;
	const toastStore = getToastStore();

	function messageToast(message: string = 'You need to login to rate this review!') {
		const toast: ToastSettings = {
			message: message,
			background: 'variant-filled-warning'
		};
		toastStore.trigger(toast);
		parent.onClose();
	}
	console.log(imagePaths);
</script>

{#if $modalStore[0]}
	<div
		class="flex flex-col screenHalfHeight max-w-4xl bg-surface-100-800-token rounded-4xl border border-surface-400-500-token"
	>
		<div
			class=" rounded-t-4xl flex items-center justify-between h-16 sm:h-20 p-4 border-b border-surface-400-500-token"
		>
			<div class="flex items-center">
				<div use:popup={userStatsDropdown} class="buttonfix flex items-center justify-center">
					<Avatar
						src=""
						initials={$modalStore[0].meta.initials}
						class=" hover:!border-primary-500 transition-all duration-300 ease-in-out cursor-pointer"
						background="bg-surface-100-800-token"
						border="border-2 border-surface-400-500-token"
					/>
				</div>
				<span class="ml-2 truncate">{$modalStore[0].meta.username}</span>
			</div>
			<div data-popup="userStatsDropdown">
				<div
					class="z-50 absolute left-[-38px] p-2 top-[-8px] bg-surface-100-800-token border border-surface-400-500-token rounded-4xl shadow-xl sm:hidden"
				>
					<div class="items-center flex whitespace-nowrap">
						<DotIcon /><span
							>{$modalStore[0].meta.reviews}
							{$modalStore[0].meta.reviews === 1 ? 'Review' : 'Reviews'}</span
						>
					</div>
					<div class="items-center flex whitespace-nowrap">
						<DotIcon /><span
							>Helpful user score <b>{$modalStore[0].meta.user_score * 100} %</b></span
						>
					</div>
					<div class="items-center flex whitespace-nowrap">
						<DotIcon /><span><b>{$modalStore[0].meta.review_score}</b> found this helpful</span>
					</div>
				</div>
			</div>
			<div class="flex flex-col md:flex-row">
				<div
					class="items-center ml-2 lg:ml-4 hidden sm:flex whitespace-nowrap text-sm md:text-base"
				>
					<DotIcon /><span
						>{$modalStore[0].meta.reviews}
						{$modalStore[0].meta.reviews === 1 ? 'Review' : 'Reviews'}</span
					>
				</div>
				<div
					class="items-center ml-2 lg:ml-4 hidden sm:flex whitespace-nowrap text-sm md:text-base"
				>
					<DotIcon /><span>Helpful user score <b>{$modalStore[0].meta.user_score * 100}%</b></span>
				</div>
			</div>
			<div class="items-center ml-2 lg:ml-4 hidden sm:flex whitespace-nowrap text-sm md:text-base">
				<DotIcon /><span><b>{$modalStore[0].meta.review_score}</b> found this helpful</span>
			</div>

			<div class="ml-2 lg:ml-4">
				<form action="?/likeReview" method="POST" use:enhance class="flex items-center">
					<input type="hidden" name="review_id" value={$modalStore[0].meta.review_id} />
					<input type="hidden" name="like" value={likeSatus} />
					{#if $user && $user.display_name !== $modalStore[0].meta.username}
						<button
							class="btn-icon btn-icon-md buttonfix variant-filled-surface cursor-pointer mr-2 focus:!ring-0 focus:!outline-none !outline-none"
							on:click={() => {
								likeSatus = true;
								setTimeout(() => {
									$productRefreshState = true;
									parent.onClose();
								}, 100);
							}}
							type="submit"
						>
							{#if isLiked}
								<ThumbsUpFilled class="w-5 h-5" />
							{:else}
								<ThumbsUp class="w-5 h-5 " />
							{/if}
						</button>
						<button
							class="btn-icon btn-icon-md buttonfix variant-filled-surface cursor-pointer focus:!ring-0 focus:!outline-none !outline-none"
							on:click={() => {
								likeSatus = false;
								setTimeout(() => {
									$productRefreshState = true;
									parent.onClose();
								}, 100);
							}}
							type="submit"
						>
							{#if isDisliked}
								<ThumbsDownFilled class="w-5 h-5" />
							{:else}
								<ThumbsDown class="w-5 h-5" />
							{/if}
						</button>
					{:else if $user && $user.display_name === $modalStore[0].meta.username}
						<button
							type="button"
							class="btn-icon btn-icon-md buttonfix variant-filled-surface cursor-pointer mr-2 focus:!ring-0 focus:!outline-none !outline-none"
							on:click={() => messageToast('You cannot rate your own review!')}
						>
							<ThumbsUp class="w-5 h-5" />
						</button>
						<button
							type="button"
							class="btn-icon btn-icon-md buttonfix variant-filled-surface cursor-pointer focus:!ring-0 focus:!outline-none !outline-none"
							on:click={() => messageToast('You cannot rate your own review!')}
						>
							<ThumbsDown class="w-5 h-5" />
						</button>
					{:else}
						<button
							type="button"
							class="btn-icon btn-icon-md buttonfix variant-filled-surface cursor-pointer mr-2 focus:!ring-0 focus:!outline-none !outline-none"
							on:click={() => messageToast()}
						>
							<ThumbsUp class="w-5 h-5" />
						</button>
						<button
							type="button"
							class="btn-icon btn-icon-md buttonfix variant-filled-surface cursor-pointer focus:!ring-0 focus:!outline-none !outline-none"
							on:click={() => messageToast()}
						>
							<ThumbsDown class="w-5 h-5" />
						</button>
					{/if}
				</form>
			</div>
		</div>
		<div
			class="card p-4 rounded-4xl mx-2 mt-2 h-2/5 border border-surface-400-500-token bg-surface-100-800-token shadow-xl"
		>
			<Splide hasTrack={false} aria-label="Product Images" class="h-full relative z-0">
				<div
					class="splide__arrows absolute z-20 w-full flex justify-between top-1/2 transform -translate-y-1/2 px-2"
				>
					<button
						class="btn-icon btn-icon-md variant-filled-surface shadow-xl cursor-pointer splide__arrow splide__arrow--prev buttonfix left-1 focus:!ring-0 focus:!outline-none !outline-none"
					>
						<ArrowLeft class="mt-0.5 w-6 h-6" />
					</button>
					<button
						class="btn-icon btn-icon-md variant-filled-surface shadow-xl cursor-pointer splide__arrow splide__arrow--next buttonfix right-1 focus:!ring-0 focus:!outline-none !outline-none"
					>
						<ArrowRight class="mt-0.5 w-6 h-6" />
					</button>
				</div>
				<SplideTrack class="flex justify-center h-full">
					{#each imagePaths as imagePath}
						<SplideSlide class="flex justify-center">
							<img
								src="../review_images/{imagePath}"
								alt="Product"
								loading="lazy"
								class="object-contain"
							/>
						</SplideSlide>
					{/each}
				</SplideTrack>
			</Splide>
		</div>
		<div class="flex flex-col grow p-4 overflow-y-auto">
			{$modalStore[0].body ?? '(body missing)'}
		</div>
		<footer
			class="h-16 sm:h-20 p-4 rounded-b-4xl border-t border-surface-400-500-token flex items-center justify-center"
		>
			<button
				class="btn {parent.buttonNeutral} focus:!ring-0 focus:!outline-none !outline-none border border-surface-500"
				on:click={parent.onClose}
			>
				Close
			</button>
		</footer>
	</div>
{/if}

<style>
	.screenHalfHeight {
		height: 75vh;
	}
	.buttonfix {
		width: 43px;
		height: 43px;
	}
</style>
