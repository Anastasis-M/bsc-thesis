<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import ThFilter from '$lib/components/ThFilter.svelte';
	import ThSort from '$lib/components/ThSort.svelte';
	import RowCount from '$lib/components/RowCount.svelte';
	import RowsPerPage from '$lib/components/RowsPerPage.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import CategoryIcon from '~icons/tabler/category';
	import FullStarIcon from '~icons/material-symbols/star-rounded';
	import EuroIcon from '~icons/clarity/euro-line';
	import EditIcon from '~icons/material-symbols-light/edit-square-rounded';
	import { getModalStore, getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings, ToastSettings, ModalSettings } from '@skeletonlabs/skeleton';
	import { DataHandler } from '@vincjo/datatables/remote';
	import type { State, Row } from '@vincjo/datatables/remote';
	import { onMount } from 'svelte';
	import { reviewRefreshState } from '$lib/stores';

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

	const modalStore = getModalStore();

	let editReviewTextModal: ModalSettings = {
		component: 'editReviewTextModal',
		type: 'component',
		body: 'Previous review text will be overwritten!',
		title: 'Edit review text',
		meta: {
			review_id: '',
			review_text: ''
		}
	};

	const handler = new DataHandler<Row>([], { rowsPerPage: 2, totalRows: 1 });
	const rows = handler.getRows();
	onMount(async () => {
		handler.onChange((state: State) => reload(state));
		handler.invalidate();
	});

	const toastStore = getToastStore();

	async function reload(state: State) {
		const response = await fetch(`http://localhost:5173/dashboard/myreviews?${getParams(state)}`);
		const returnedData = await response.json();
		const reviews = returnedData.reviews ?? [];
		const total = returnedData.total ?? 1;
		if (!response.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error getting reviews',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		handler.setTotalRows(total);
		return reviews;
	}

	$: {
		if ($reviewRefreshState) {
			handler.invalidate();
		}
		$reviewRefreshState = false;
	}

	function getParams(state: State) {
		const { pageNumber, rowsPerPage, sort, filters, search } = state;

		let params = `_page=${pageNumber}`;

		if (rowsPerPage) {
			params += `&_limit=${rowsPerPage}`;
		}
		if (sort) {
			params += `&_sort=${sort.orderBy}&_order=${sort.direction}`;
		}
		if (filters) {
			params += filters.map(({ filterBy, value }) => `&${filterBy}=${value}`).join();
		}
		if (search) {
			params += `&q=${search}`;
		}
		return params;
	}
</script>

<div
	class="flex items-center justify-between p-4 variant-ghost-surface rounded-t-4xl h-16 sm:h-20 shrink-0"
>
	<button
		class="btn-icon btn-icon-md bg-surface-200-700-token cursor-pointer sm:hidden shrink-0 shadow-xl"
		on:click={() => drawerStore.open(drawerSettings)}
		><CategoryIcon />
	</button>
	<span class="text-3xl font-semibold hidden md:block text-white text-shadow whitespace-nowrap"
		>My reviews</span
	>
	<Search {handler} />
	<RowsPerPage {handler} />
</div>
<div class=" overflow-x-auto space-y-4 p-2">
	<!-- Table -->
	<table class="table table-hover table-compact w-full table-auto rounded-t-4xl">
		<thead>
			<tr>
				<ThSort {handler} orderBy="product_name">Product name</ThSort>
				<ThSort {handler} orderBy="store_name">Store name</ThSort>
				<ThSort {handler} orderBy="rating">Rating</ThSort>
				<ThSort {handler} orderBy="review_text">Review text</ThSort>
				<ThSort {handler} orderBy="price">Price</ThSort>
				<ThSort {handler} orderBy="review_date">Review date</ThSort>
				<th>
					<div class="flex h-full items-center justify-start gap-x-2">Edit</div>
				</th>
			</tr>
			<tr>
				<ThFilter {handler} filterBy="product_name" />
				<ThFilter {handler} filterBy="store_name" />
				<ThFilter {handler} filterBy="rating" />
				<ThFilter {handler} filterBy="review_text" />
				<ThFilter {handler} filterBy="price" />
				<ThFilter {handler} filterBy="review_date" />
				<th> </th>
			</tr>
		</thead>
		<tbody>
			{#each $rows as row}
				<tr>
					<td>{row.product_name}</td>
					<td>{row.store_name}</td>
					<td class="flex items-center">{row.rating} <FullStarIcon class="w-4 h-4" /></td>
					<td>{row.review_text}</td>
					<td class="flex items-center">{row.price} <EuroIcon class="w-4 h-4" /></td>
					<td>{row.review_date}</td>
					<td>
						<button
							class="btn-icon btn-icon-md variant-filled-surface cursor-pointer shadow-xl"
							on:click={() => {
								editReviewTextModal.meta.review_id = row.id;
								editReviewTextModal.meta.review_text = row.review_text;
								modalStore.trigger(editReviewTextModal);
							}}
						>
							<EditIcon class="w-6 h-6" />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- Footer -->
	<footer class="flex justify-between">
		<RowCount {handler} />
		<Pagination {handler} />
	</footer>
</div>

<style>
	.text-shadow {
		text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
	}
</style>
