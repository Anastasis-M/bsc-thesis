<script lang="ts">
	import type { PageData } from './$types';
	import AccountSettigns from '$lib/components/accountSettigns.svelte';
	import { superForm } from 'sveltekit-superforms';
	import ExploreBar from '$lib/components/ExploreBar.svelte';

	export let data: PageData;

	const { form, errors, constraints, enhance, message, delayed } = superForm(
		data.accountSettingsNameForm,
		{
			resetForm: true,
			delayMs: 500,
			timeoutMs: 1500
		}
	);

	const {
		form: accountSettingsEmailForm,
		errors: accountSettingsEmailErrors,
		constraints: accountSettingsEmailConstraints,
		enhance: accountSettingsEmailEnhance,
		message: accountSettingsEmailMessage,
		delayed: accountSettingsEmailDelayed
	} = superForm(data.accountSettingsEmailForm, {
		resetForm: true,
		delayMs: 500,
		timeoutMs: 1500
	});

	const {
		form: accountSettingsPasswordForm,
		errors: accountSettingsPasswordErrors,
		constraints: accountSettingsPasswordConstraints,
		enhance: accountSettingsPasswordEnhance,
		message: accountSettingsPasswordMessage,
		delayed: accountSettingsPasswordDelayed
	} = superForm(data.accountSettingsPasswordForm, {
		resetForm: true,
		delayMs: 500,
		timeoutMs: 1500
	});
</script>

<div
	class="flex flex-col variant-ghost-surface mb-2 rounded-4xl absolute top-20 sm:top-24 bottom-0 right-2 left-2 sm:left-60 overflow-hidden"
>
<ExploreBar title="Account" />
	<AccountSettigns
		{form}
		{errors}
		{constraints}
		{enhance}
		{message}
		{delayed}
		{accountSettingsEmailForm}
		{accountSettingsEmailErrors}
		{accountSettingsEmailConstraints}
		{accountSettingsEmailEnhance}
		{accountSettingsEmailMessage}
		{accountSettingsEmailDelayed}
		{accountSettingsPasswordForm}
		{accountSettingsPasswordErrors}
		{accountSettingsPasswordConstraints}
		{accountSettingsPasswordEnhance}
		{accountSettingsPasswordMessage}
		{accountSettingsPasswordDelayed}
	/>
</div>
