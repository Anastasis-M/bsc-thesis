<script lang="ts">
	import ArrowLeft from '~icons/material-symbols/arrow-left-alt-rounded';
	import ArrowRight from '~icons/material-symbols/arrow-right-alt-rounded';
	import type { DataHandler } from '@vincjo/datatables/remote';
	export let handler: DataHandler;
	const pageNumber = handler.getPageNumber();
	const pageCount = handler.getPageCount();
	const pages = handler.getPages({ ellipsis: true });
	const setPage = (value: 'previous' | 'next' | number) => {
		handler.setPage(value);
		handler.invalidate();
	};
</script>

<!-- Desktop buttons -->
<section class="btn-group bg-surface-100-800-token [&>*+*]:border-surface-500 h-10 hidden lg:flex">
	<button
		type="button"
		class="hover:variant-soft-primary"
		class:disabled={$pageNumber === 1}
		on:click={() => setPage('previous')}
	>
		<ArrowLeft class="w-6 h-6" />
	</button>
	{#each $pages as page}
		<button
			type="button"
			class="hover:variant-soft-primary"
			class:active={$pageNumber === page}
			class:ellipse={page === null}
			on:click={() => setPage(page)}
		>
			{page ?? '...'}
		</button>
	{/each}
	<button
		type="button"
		class="hover:variant-soft-primary shadow-xl"
		class:disabled={$pageNumber === $pageCount}
		on:click={() => setPage('next')}
	>
		<ArrowRight class="w-6 h-6" />
	</button>
</section>

<!-- Mobile buttons -->
<section class="lg:hidden">
	<button
		type="button"
		class="btn bg-surface-100-800-token mr-2 mb-2 hover:variant-soft-primary shadow-xl"
		class:disabled={$pageNumber === 1}
		on:click={() => setPage('previous')}
	>
		<ArrowLeft class="w-6 h-6" />
	</button>
	<button
		type="button"
		class="btn bg-surface-100-800-token mb-2 hover:variant-soft-primary shadow-xl"
		class:disabled={$pageNumber === $pageCount}
		on:click={() => setPage('next')}
	>
		<ArrowRight class="w-6 h-6" />
	</button>
</section>
