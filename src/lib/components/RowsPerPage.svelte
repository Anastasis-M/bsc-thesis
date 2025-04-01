<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables/remote';
	export let handler: DataHandler;
	const rowsPerPage = handler.getRowsPerPage();
	const options = [2 ,5, 10, 20, 50, 100];
	const setRowsPerPage = () => {
		handler.setPage(1);
		handler.invalidate();
	};
</script>

<aside class="flex place-items-center ">
	<span class="text-white text-shadow hidden sm:block mr-2">Show</span>
	<select class="select rounded-4xl bg-surface-100-800-token" bind:value={$rowsPerPage}  on:change={setRowsPerPage}>
		{#each options as option}
			<option value={option}>
				{option}
			</option>
		{/each}
	</select>
</aside>

<style>
	.text-shadow {
		text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
	}
</style>