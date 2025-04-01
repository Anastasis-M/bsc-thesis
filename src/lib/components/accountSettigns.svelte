<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { user } from '$lib/stores';
	export let form, errors, constraints, enhance, message, delayed;
	export let accountSettingsEmailForm,
		accountSettingsEmailErrors,
		accountSettingsEmailConstraints,
		accountSettingsEmailEnhance,
		accountSettingsEmailMessage,
		accountSettingsEmailDelayed;
	export let accountSettingsPasswordForm,
		accountSettingsPasswordErrors,
		accountSettingsPasswordConstraints,
		accountSettingsPasswordEnhance,
		accountSettingsPasswordMessage,
		accountSettingsPasswordDelayed;

	$: {
		if ($message?.includes('Name changed successfully to ')) {
			$user.display_name = $message.split('Name changed successfully to ')[1].trim();
		} else if ($accountSettingsEmailMessage?.includes('Email changed successfully to ')) {
			$user.email = $accountSettingsEmailMessage.split('Email changed successfully to ')[1].trim();
		}
	}
</script>

<div class="m-2 overflow-y-scroll">
	<div
		class="card p-4 w-modal shadow-xl rounded-3xl mx-auto overflow-auto"
	>
		<header class="text-2xl font-bold flex justify-center">Update your profile</header>
		<article class="flex justify-center items-center text-center mb-4">
			Change Display Name and Login Credentials.
		</article>
		<div class="flex flex-col sm:flex-row mb-4">
			<form
				method="POST"
				action="?/changeName"
				use:enhance
				on:submit|preventDefault
				class="sm:mr-2"
			>
				<div class=" border border-surface-400-500-token p-4 space-y-4 rounded-4xl shadow-xl">
					<label class="label" for="fullname">
						<span>Full name</span>
						<input
							name="fullname"
							class="input"
							type="text"
							placeholder="Enter name..."
							aria-invalid={$errors.fullname ? 'true' : undefined}
							bind:value={$form.fullname}
							{...$constraints.fullname}
						/>
						{#if $errors.fullname}<span class="invalid text-red-500">{$errors.fullname}!</span>{/if}
					</label>

					{#if $message?.includes('Name changed successfully to')}
						<div class="text-green-500 text-sm">{$message}</div>
					{:else if $message}
						<div class="text-red-500 text-sm">{$message}</div>
					{/if}
					{#if $delayed}
						<ProgressRadial class="mx-auto h-8 w-8" />
					{/if}
				</div>
				<footer class="flex justify-center mt-4 mb-4">
					<button class="btn variant-filled-tertiary shadow-xl" type="submit">Change name</button>
				</footer>
			</form>
			<form
				method="POST"
				action="?/changeEmail"
				use:accountSettingsEmailEnhance
				on:submit|preventDefault
			>
				<div class="border border-surface-400-500-token shadow-xl p-4 space-y-4 rounded-4xl">
					<label class="label" for="email">
						<span>Email</span>
						<input
							name="email"
							class="input"
							type="email"
							placeholder="Enter email address..."
							aria-invalid={$accountSettingsEmailErrors.email ? 'true' : undefined}
							bind:value={$accountSettingsEmailForm.email}
							{...$accountSettingsEmailConstraints.email}
						/>
						{#if $accountSettingsEmailErrors.email}
							<span class="invalid text-red-500">{$accountSettingsEmailErrors.email}!</span>
						{/if}
					</label>
					{#if $accountSettingsEmailMessage?.includes('Email changed successfully to')}
						<div class="text-green-500 text-sm">{$accountSettingsEmailMessage}</div>
					{:else if $accountSettingsEmailMessage}
						<div class="text-red-500 text-sm">{$accountSettingsEmailMessage}</div>
					{/if}
					{#if $accountSettingsEmailDelayed}
						<ProgressRadial class="mx-auto h-8 w-8" />
					{/if}
				</div>
				<footer class=" flex justify-center mt-4">
					<button class="btn variant-filled-tertiary shadow-xl" type="submit">Change email</button>
				</footer>
			</form>
		</div>
		<form
			method="POST"
			action="?/changePassword"
			use:accountSettingsPasswordEnhance
			on:submit|preventDefault
		>
			<div class="border border-surface-400-500-token shadow-xl p-4 space-y-4 rounded-4xl mb-4">
				<label class="label" for="currentPassword">
					<span>Current password</span>
					<input
						name="currentPassword"
						class="input"
						type="password"
						placeholder="Enter password..."
						aria-invalid={$accountSettingsPasswordErrors.currentPassword ? 'true' : undefined}
						bind:value={$accountSettingsPasswordForm.currentPassword}
						{...$accountSettingsPasswordConstraints.currentPassword}
					/>
					{#if $accountSettingsPasswordErrors.currentPassword}<span class="invalid text-red-500"
							>{$accountSettingsPasswordErrors.currentPassword}!</span
						>{/if}
				</label>
				<span class="m-2">New password</span>
				<input
					name="newPassword"
					class="input"
					type="password"
					placeholder="Enter new password..."
					aria-invalid={$accountSettingsPasswordErrors.newPassword ? 'true' : undefined}
					bind:value={$accountSettingsPasswordForm.newPassword}
					{...$accountSettingsPasswordConstraints.newPassword}
				/>
				{#if $accountSettingsPasswordErrors.newPassword}<span class="invalid text-red-500"
						>{$accountSettingsPasswordErrors.newPassword}!</span
					>{/if}
				<span class="m-2">Confirm new password</span>
				<input
					name="confirmPassword"
					class="input"
					type="password"
					placeholder="Confirm new password..."
					aria-invalid={$accountSettingsPasswordErrors.confirmPassword ? 'true' : undefined}
					bind:value={$accountSettingsPasswordForm.confirmPassword}
					{...$accountSettingsPasswordConstraints.confirmPassword}
				/>
				{#if $accountSettingsPasswordErrors.confirmPassword}<span class="invalid text-red-500"
						>{$accountSettingsPasswordErrors.confirmPassword}!</span
					>{/if}
				{#if $accountSettingsPasswordMessage == 'Password changed successfully!'}
					<div class="text-green-500 text-sm">{$accountSettingsPasswordMessage}</div>
				{:else if $accountSettingsPasswordMessage}
					<div class="text-red-500 text-sm">{$accountSettingsPasswordMessage}</div>
				{/if}
				{#if $accountSettingsPasswordDelayed}
					<ProgressRadial class="mx-auto h-8 w-8" />
				{/if}
			</div>
			<footer class="modal-footer flex justify-center mt-4">
				<button class="btn variant-filled-tertiary shadow-xl" type="submit">Change password</button>
			</footer>
		</form>
	</div>
</div>
