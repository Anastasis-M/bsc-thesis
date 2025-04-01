<script lang="ts">
	import { Paginator } from '@skeletonlabs/skeleton';
	import type { PaginationSettings } from '@skeletonlabs/skeleton';
	import {
		total,
		paginatedCards,
		sortBy,
		sortOrder,
		pageNum,
		cards,
		searchTerm,
		location,
		storeId
	} from '$lib/stores';
	import { page } from '$app/stores';

	async function onPageChange(e: CustomEvent): Promise<void> {
		$pageNum = e.detail;
		const res = await fetch(
			'http://localhost:5173' +
				url +
				'?' +
				'search=' +
				$searchTerm +
				'&cards=' +
				$cards +
				'&page=' +
				e.detail +
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

	let paginationSettings = {
		page: $pageNum,
		limit: 10,
		size: $total,
		amounts: [1, 2, 5, 10]
	} satisfies PaginationSettings;

	$: {
		paginationSettings.size = $total;
		paginationSettings.page = $pageNum;
	}

	let url;
	$: {
		if ($page.url.pathname === '/dashboard/favourites') {
			url = '/dashboard/favourites';
		} else {
			url = '/api/cards';
		}
	}
</script>

<div
	class="flex items-center justify-center p-4 variant-ghost-surface rounded-b-4xl h-16 sm:h-20 shrink-0"
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
