<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { user, productRefreshState } from '$lib/stores';
	import {
		searchTerm,
		cards,
		pageNum,
		sortBy,
		sortOrder,
		location,
		storeId,
		total,
		paginatedCards
	} from '$lib/stores';

	export let parent: any;
	const modalStore = getModalStore();
	const { form, errors, constraints, enhance, message, delayed } = superForm($page.data.loginForm, {
		resetForm: true,
		delayMs: 500,
		timeoutMs: 1500
	});

	async function fetchCards() {
		const res = await fetch(
			'http://localhost:5173/api/cards?' +
				'search=' +
				$searchTerm +
				'&cards=' +
				$cards +
				'&page=' +
				$pageNum +
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

	$: {
		if ($message !== 'You are now logged in!') {
			$user = null;
		} else {
			$user = $page.data.user;
			const toast: ToastSettings = {
				message: 'You are now logged in!'
			};
			toastStore.trigger(toast);
			if (!$page.url.pathname.includes('/products')) {
				(async () => {
					try {
						await fetchCards();
					} catch (error) {
						const toast: ToastSettings = {
							message: 'Error retrieving products. Please try again later.',
							background: 'variant-filled-error'
						};
						toastStore.trigger(toast);
					}
				})();
			} else {
				$productRefreshState = true;
			}
			parent.onClose();
		}
	}

	const toastStore = getToastStore();
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4 rounded-4xl">
		<header class="text-2xl font-bold flex justify-center items-center">
			{$modalStore[0].title ?? 'Login'}
		</header>
		<article class="flex justify-center text-center">
			{$modalStore[0].body ?? 'Login to upload your reviews and explore rated products!'}
		</article>
		<form method="post" action="?/login" use:enhance autocomplete="off">
			<div class="modal-form border border-surface-500 p-4 space-y-4 rounded-4xl">
				<label class="label">
					<span>Email</span>
					<input
						name="email"
						class="input"
						type="email"
						placeholder="Enter email address..."
						aria-invalid={$errors.email ? 'true' : undefined}
						bind:value={$form.email}
						{...$constraints.email}
					/>
					{#if $errors.email}<span class="invalid text-red-500">{$errors.email}!</span>{/if}
				</label>
				<label class="label">
					<span>Password</span>
					<input
						name="password"
						class="input"
						type="password"
						placeholder="Enter password..."
						aria-invalid={$errors.password ? 'true' : undefined}
						bind:value={$form.password}
						{...$constraints.password}
					/>
					{#if $errors.password}<span class="invalid text-red-500">{$errors.password}!</span>{/if}
				</label>
				{#if $message == 'You are now logged in!'}
					<div class="text-green-500 text-sm">{$message}</div>
				{:else if $message}
					<div class="text-red-500 text-sm">{$message}</div>
				{/if}
				{#if $delayed}<ProgressRadial class="mx-auto h-8 w-8" />
				{/if}
			</div>

			<footer class="modal-footer flex justify-center mt-4 {parent.regionFooter}">
				<button
					type="button"
					class="btn {parent.buttonNeutral} focus:!ring-0 focus:!outline-none !outline-none border border-surface-500"
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
				<button
					class="btn {parent.buttonPositive} focus:!ring-0 focus:!outline-none !outline-none variant-filled-primary"
					type="submit"
				>
					Login</button
				>
			</footer>
		</form>
	</div>
{/if}
