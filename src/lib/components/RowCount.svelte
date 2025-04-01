<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables/remote';
	export let handler: DataHandler;
	const rowCount = handler.getRowCount();
</script>

<aside class="text-sm mr-6 bg-surface-100-800-token h-10 flex p-2 items-center rounded-4xl shadow-xl">
	{#if $rowCount.total > 0}
		<b>{$rowCount.start}</b>
		- <b>{$rowCount.end}</b>
		/ <b>{$rowCount.total}</b>
	{:else}
		No entries found
	{/if}
</aside>