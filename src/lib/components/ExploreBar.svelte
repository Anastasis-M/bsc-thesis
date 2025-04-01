<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterIcon from '~icons/ci/filter';
	import CategoryIcon from '~icons/tabler/category';
	import { getModalStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, DrawerSettings } from '@skeletonlabs/skeleton';
	import { sortBy, sortOrder } from '$lib/stores';
	import { page } from '$app/stores';

	export let title;
	const modalStore = getModalStore();

	const filterModal: ModalSettings = {
		component: 'filtersModal',
		type: 'component',
		body: 'Filter products to your liking!',
		title: 'Sort by'
	};

	const drawerStore = getDrawerStore();

	const drawerSettings: DrawerSettings = {
		id: 'example-3',
		bgDrawer: '',
		bgBackdrop: '',
		width: 'w-[224px]',
		padding: 'pt-20 pb-2 pl-2',
		height: 'h-full',
		rounded: 'rounded-4xl'
	};

	let revealBadge = false;

	$: {
		if($sortBy !== '' && $sortOrder !== '') {
			revealBadge = true;
		} else {
			revealBadge = false;
		}
	}
</script>

<div class="flex items-center justify-between p-4 variant-ghost-surface rounded-t-4xl h-16 sm:h-20 shrink-0">
	<button
		class="btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer sm:hidden shrink-0"
		on:click={() => drawerStore.open(drawerSettings)}
	>
		<CategoryIcon />
	</button>
	<span class="text-3xl font-semibold hidden sm:flex items-start h-10 text-shadow text-white"
		>{title ?? 'Explore'}</span
	>
	{#if !$page.url.pathname.includes('account')}
		<SearchBar />
	
	<button
		on:click={() => modalStore.trigger(filterModal)}
		class="btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer relative shadow-xl shrink-0"
	>
		<FilterIcon />
		{#if revealBadge}
			<span class="badge-icon w-3 h-3 variant-filled-tertiary absolute -top-0 -right-0 z-5"></span>
		{/if}
	</button>
	{/if}
</div>

<style>
	.text-shadow {
		text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
	}
</style>
