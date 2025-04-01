<script lang="ts">
	import EuroIcon from '~icons/clarity/euro-line';
	import EmptyStarIcon from '~icons/ic/round-star-outline';
	import HalfStarIcon from '~icons/ic/round-star-half';
	import FullStarIcon from '~icons/material-symbols/star-rounded';
	import EmptyHeartIcon from '~icons/ic/round-favorite-border';
	import FilledHeartIcon from '~icons/ic/outline-favorite';
	import BrokenHeartIcon from '~icons/ph/heart-break-bold';
	import { Ratings, getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import {
		total,
		user
	} from '$lib/stores';

	function submitForm() {
		if ($user) {
			is_favourite = !is_favourite;
		} else {
			modalStore.trigger(loginModal);
		}
	}

	export let cardId;
	export let name;
	export let store;
	export let price;
	export let rating;
	export let is_favourite;
	export let productImage;
	export let form;
	export let changeIcon = false;
	let hide = false;

	$: is_favourite;
	$: hide;

	const modalStore = getModalStore();

	const loginModal: ModalSettings = {
		component: 'loginModal',
		type: 'component',
		body: 'Login to upload your reviews and explore rated products!',
		title: 'Login'
	};
</script>

{#if !hide}
	<div
		class="card bg-surface-100-800-token w-full @lg:w-60 rounded-4xl shadow-xl m-0 overflow-hidden"
	>
		<a href="/products/{cardId}" class="flex flex-row @lg:block">
			<div
				class="p-2 border-r w-1/3 min-w-40 @lg:w-full @lg:border-none border-surface-400-500-token"
			>
				<div class="border border-surface-400-500-token rounded-3xl p-2">
					<img src={productImage} alt="product cover" class="w-full h-48 object-contain" />
				</div>
			</div>
			<div class="flex flex-col justify-center w-2/3 @lg:w-full grow-0">
				<div class="py-2 flex justify-between border-y border-surface-400-500-token w-full">
					<div class=" pr-2 flex items-center justify-start w-1/2">
						<span
							class="w-full font-semibold p-2 overflow-hidden overflow-ellipsis whitespace-nowrap"
						>
							{name}
						</span>
					</div>
					<div class=" pr-2 flex items-center justify-end w-1/2">
						<span
							class=" font-semibold p-2 border border-surface-400-500-token rounded-4xl flex items-center"
						>
							{price}
							<EuroIcon class="w-6 h-6 ml-2" />
						</span>
					</div>
				</div>
				<div
					class="p-2 flex flex-col @lg:flex-row justify-between items-center border-b border-surface-400-500-token w-full shrink"
				>
					<div class="flex items-center justify-start @lg:w-1/2 mb-2 @lg:m-0">
						<Ratings spacing="space-x-0" value={rating} max={5} class="">
							<svelte:fragment slot="empty"><EmptyStarIcon class="w-6 h-6" /></svelte:fragment>
							<svelte:fragment slot="half"><HalfStarIcon class="w-6 h-6 " /></svelte:fragment>
							<svelte:fragment slot="full"><FullStarIcon class="w-6 h-6" /></svelte:fragment>
						</Ratings>
					</div>
					<div class="flex items-center @lg:justify-end @lg:w-1/2 @lg:ml-2">
						<span
							class="max-w-36 @sm:max-w-44 font-semibold p-2 border border-surface-400-500-token rounded-4xl text-center whitespace-nowrap overflow-hidden text-ellipsis"
						>
							{store}
						</span>
					</div>
				</div>
			</div>
		</a>
		<form bind:this={form} method="post" action="?/likeProduct" use:enhance>
			<div
				class="py-2 flex justify-center border border-surface-400-500-token @lg:border-none rounded-b-4xl"
			>
				{#if $user}
					<button
						type="submit"
						class=" font-semibold p-2 flex items-center justify-center cursor-pointer"
						on:click={() => {
							if (changeIcon) {
								setTimeout(() => {
									hide = true;
								}, 100);
								$total -= 1;
							}
							submitForm();
							
						}}
					>
						{#if is_favourite && changeIcon === false}
							<FilledHeartIcon class="w-6 h-6" />
						{:else if !is_favourite && changeIcon === false}
							<EmptyHeartIcon class="w-6 h-6" />
						{:else if changeIcon === true}
							<BrokenHeartIcon class="w-6 h-6" />
						{:else if is_favourite && changeIcon === true}
							<FilledHeartIcon class="w-6 h-6" />
						{:else if !is_favourite && changeIcon === false}
							<EmptyHeartIcon class="w-6 h-6" />
						{/if}
					</button>
				{:else}
					<button
						type="button"
						class=" font-semibold p-2 flex items-center justify-center cursor-pointer"
						on:click={() => {
							modalStore.trigger(loginModal);
						}}
					>
						<EmptyHeartIcon class="w-6 h-6" />
					</button>
				{/if}
			</div>

			<input type="hidden" name="cardId" value={cardId} />
		</form>
	</div>
{/if}
