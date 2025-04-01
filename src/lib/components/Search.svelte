<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables/remote';
	export let handler: DataHandler;
	let value: string;
	let timeout: any;
	const search = () => {
		handler.search(value);
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			handler.invalidate();
		}, 400);
	};
</script>

<div class="flex-grow flex items-center justify-center searchfix mx-2">
	<div
		class="relative max-searchbar-width w-full transition-all ease-in-out duration-300 rounded-4xl bg-surface-100-800-token shadow-xl h-full"
	>
		<div class=" absolute left-0 grid place-items-center h-full w-12">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
		<div class="justify-self-start w-full h-full rounded-4xl">
			<input
				type="search"
				placeholder="Search..."
				bind:value
				on:input={search}
				class="pl-10 w-full h-full rounded-4xl outline-none bg-transparent flex items-center cursor-text border-none focus:ring-0 focus:outline-none"
			/>
		</div>
	</div>
</div>

<style>
	.max-searchbar-width {
		max-width: 500px;
	}
	.searchfix{
		height: 43px;
	}
</style>