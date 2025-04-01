<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { user } from '$lib/stores';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
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
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

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

	export let parent: any;

	const modalStore = getModalStore();
	const {
		form: registerForm,
		errors: registerErrors,
		enhance: registerEnhance,
		message: registerMessage,
		constraints: registerConstraints,
		delayed: registerDelayed
	} = superForm($page.data.registerForm, {
		resetForm: true,
		delayMs: 500,
		timeoutMs: 1500
	});

	$: {
		if ($registerMessage !== 'You are now registered!') {
			$user = null;
		} else {
			$user = $page.data.user;
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
			modalStore.close();
		}
	}

	const toastStore = getToastStore();
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4 rounded-4xl">
		<header class="text-2xl font-bold flex justify-center">
			{$modalStore[0].title ?? 'Register'}
		</header>
		<article class="flex justify-center text-center">
			{$modalStore[0].body ?? 'Register to upload your reviews and explore rated products!'}
		</article>
		<form method="POST" action="?/register" use:registerEnhance>
			<div class="modal-form border border-surface-500 p-4 space-y-4 rounded-4xl">
				<label class="label" for="fullname">
					<span>Full name</span>
					<input
						name="fullname"
						class="input"
						type="text"
						placeholder="ie. Jane Doe..."
						aria-invalid={$registerErrors.fullname ? 'true' : undefined}
						bind:value={$registerForm.fullname}
						{...$registerConstraints.fullname}
					/>
					{#if $registerErrors.fullname}<span class="invalid text-red-500"
							>{$registerErrors.fullname}!</span
						>{/if}
				</label>
				<label class="label" for="email">
					<span>Email</span>
					<input
						name="email"
						class="input"
						type="email"
						placeholder="Enter email address..."
						aria-invalid={$registerErrors.email ? 'true' : undefined}
						bind:value={$registerForm.email}
						{...$registerConstraints.email}
					/>
					{#if $registerErrors.email}<span class="invalid text-red-500"
							>{$registerErrors.email}!</span
						>{/if}
				</label>
				<label class="label" for="password">
					<span>Password</span>
					<input
						name="password"
						class="input"
						type="password"
						placeholder="Enter password..."
						aria-invalid={$registerErrors.password ? 'true' : undefined}
						bind:value={$registerForm.password}
						{...$registerConstraints.password}
					/>
					{#if $registerErrors.password}<span class="invalid text-red-500"
							>{$registerErrors.password}!</span
						>{/if}
				</label>
				{#if $registerMessage == 'You are now registered!'}
					<div class="text-green-500 text-sm">{$registerMessage}</div>
				{:else if $registerMessage}
					<div class="text-red-500 text-sm">{$registerMessage}</div>
				{/if}
				{#if $registerDelayed}<ProgressRadial class="mx-auto h-8 w-8" />
				{/if}
			</div>
			<footer class="modal-footer flex justify-center mt-4 {parent.regionFooter}">
				<button
					type="button"
					class="btn {parent.buttonNeutral} focus:!outline-none !outline-none border-0.5 border-surface-500"
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
				<button
					class="btn {parent.buttonPositive} focus:!ring-0 focus:!outline-none !outline-none variant-filled-primary"
					type="submit">Register</button
				>
			</footer>
		</form>
	</div>
{/if}
