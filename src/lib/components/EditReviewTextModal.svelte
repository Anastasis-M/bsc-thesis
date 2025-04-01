<script lang="ts">
	import {page} from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { reviewRefreshState } from '$lib/stores';
	import { getToastStore, focusTrap, ProgressRadial, getModalStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	export let parent: any;

	const modalStore = getModalStore();

	const { form, errors, constraints, enhance, message, delayed } = superForm($page.data.editReviewTextForm, {
		resetForm: true,
		delayMs: 500,
		timeoutMs: 1500
	});
	
	$: {
		if ($message == 'Review edited successfully!') {
			const toast: ToastSettings = {
				message: 'Review edited successfully!',
			};
			toastStore.trigger(toast);

				$reviewRefreshState = true;
			modalStore.close();
		}
	}
	$form.reviewText = $modalStore[0].meta.review_text;
	const toastStore = getToastStore();
	let isFocused: boolean = true;
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4 rounded-4xl">
		<header class="text-2xl font-bold flex justify-center items-center">{$modalStore[0].title ?? 'Edit review text'}</header>
		<article class="flex justify-center">{$modalStore[0].body ?? 'Previous review text will be overwritten!'}</article>

		<form
			use:focusTrap={isFocused}
			method="post"
			action="?/editReviewText"
			use:enhance
			on:submit|preventDefault
		>
		<div class="modal-form border border-surface-500 p-4 rounded-4xl shadow-xl">
			<input type="hidden" name="reviewId" value={$modalStore[0].meta.review_id} />
			<label for="reviewText" class="label">
				<span>Review text:</span>
				<textarea
				data-focusindex="0"
					id="reviewText"
					name="reviewText"
					rows="4"
					class="textarea input"
					placeholder="Write your thoughts here..."
					aria-invalid={$errors.reviewText ? 'true' : undefined}
					bind:value={$form.reviewText}
					{...$constraints.reviewText}
				/>

				{#if $errors.reviewText}<span class="invalid text-red-500">{$errors.reviewText}!</span>{/if}
			</label>

			{#if $message == 'Review edited successfully!'}
				<div class="text-green-500 text-sm">{$message}</div>
			{:else if $message}
				<div class="text-red-500 text-sm">{$message}</div>
			{/if}
			{#if $delayed}<ProgressRadial class="mx-auto h-8 w-8 mt-2" />
			{/if}
		</div>
			<footer class="modal-footer flex justify-center mt-4 {parent.regionFooter}">
				<button class="btn {parent.buttonNeutral} shadow-xl" on:click={parent.onClose}
					>{parent.buttonTextCancel}</button
				>
				<button class="btn {parent.buttonPositive} shadow-xl" type="submit">Upload</button>
			</footer>
			
		</form>
	</div>
{/if}
