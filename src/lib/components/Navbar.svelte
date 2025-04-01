<script lang="ts">
	import ArrowLeft from '~icons/material-symbols/arrow-left-alt-rounded';
	import logo from '$lib/images/logo.png';
	import { page } from '$app/stores';
	import { TabGroup, TabAnchor, LightSwitch, Avatar } from '@skeletonlabs/skeleton';
	import UserIcon from '~icons/heroicons-outline/user';
	import HamburgerIcon from '~icons/humbleicons/bars';
	import {
		cards,
		user,
		searchTerm,
		pageNum,
		sortBy,
		sortOrder,
		storeId,
		total,
		paginatedCards,
		location
	} from '$lib/stores';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings, Toast } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	function getInitials(name) {
		let splited = name.split(' ');
		username = splited[0] + ' ' + splited[1].charAt(0) + '.';
		initials = splited[0].charAt(0) + splited[1].charAt(0);
		return {
			username,
			initials
		};
	}

	let initials = '';
	let email;
	let username;

	const guestDropdown: PopupSettings = {
		event: 'click',
		target: 'guestDropdown',
		placement: 'bottom'
	};

	const loggedInDropdown: PopupSettings = {
		event: 'click',
		target: 'loggedInDropdown',
		placement: 'bottom'
	};

	let loggedIn = false;
	let pillUrl = '/';
	$: {
		if ($user) {
			loggedIn = true;
			email = $user.email ?? '';
			username = $user.display_name ?? '';
			username = username + ' ';
			initials = getInitials(username).initials;
			pillUrl = '/dashboard/myreviews';
		} else {
			loggedIn = false;
			pillUrl = '/';
		}
	}

	const modalStore = getModalStore();

	const loginModal: ModalSettings = {
		component: 'loginModal',
		type: 'component',
		body: 'Login to upload your reviews and explore rated products!',
		title: 'Login'
	};

	function login() {
		modalStore.trigger(loginModal);
	}

	const registerModal: ModalSettings = {
		component: 'registerModal',
		type: 'component',
		body: 'Register to upload your reviews and explore rated products!',
		title: 'Register'
	};
	function register() {
		modalStore.trigger(registerModal);
	}

	const toastStore = getToastStore();
	function getGeolocation() {
		if (navigator.geolocation) {
			const toast: ToastSettings = {
				message: 'Getting location...',
				background: 'variant-filled-surface'
			};
			toastStore.trigger(toast);
			navigator.geolocation.getCurrentPosition(
				(position) => {
					$location.x = position.coords.latitude;
					$location.y = position.coords.longitude;
					const toast: ToastSettings = {
						message: 'Location acquired!',
						background: 'variant-filled-primary'
					};
					toastStore.trigger(toast);
				},
				(error) => {
					console.log('Error getting location: ', error);
					const toast: ToastSettings = {
						message: 'Error getting location: ' + error.message,
						background: 'variant-filled-warning'
					};
					toastStore.trigger(toast);
				}
			);
		} else {
			const toast: ToastSettings = {
				message: 'Geolocation is not supported by this browser.',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(toast);
		}
	}

	function changeLOcationState() {
		if ($location.x && $location.y) {
			$location.x = null;
			$location.y = null;
			const toast: ToastSettings = {
				message: 'Location has been disabled',
				background: 'variant-filled-surface'
			};
			toastStore.trigger(toast);
		} else {
			getGeolocation();
		}
	}

	let color = '';
	$: {
		color = $location.x && $location.y ? '#F41945' : '#D5D5D9';
	}

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
		if (!res.ok) {
			const toast: ToastSettings = {
				message: returnedData.error ?? 'Error when searching for products. Please try again later.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
		$total = returnedData.total;
		$paginatedCards = returnedData.paginatedCards;
	}
</script>

<nav
	class=" h-16 sm:h-20 variant-ghost-surface rounded-4xl m-2 p-4 flex items-center justify-between"
>
	<!-- Logo -->
	{#if !$page.url.pathname.includes('/products')}
	<a href="/" class="flex items-center shrink-0 w-144">
		<img src={logo} class="h-8 sm:mr-3" alt="ReviewPal Logo" />
		<span
			class="self-center text-3xl font-semibold whitespace-nowrap hidden sm:block text-shadow text-white"
			>ReviewPal</span
		>
	</a>
	{:else}
	<div class="shrink-0 w-144">
		<button
					type="button"
					class="btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer w-full transition-all duration-0 shadow-xl buttonfix"
					on:click={() => {
						window.history.back();
					}}
				>
					<ArrowLeft class="w-6 h-6" />
				</button>
	</div>
	
	{/if}

	<!-- Reviews and dashboard pill -->
	<TabGroup
		justify="justify-evenly"
		active="variant-filled-primary"
		hover="hover:variant-soft-primary"
		border=""
		rounded="rounded-3xl"
		class=" shadow-xl bg-surface-100-800-token h-12 rounded-4xl p-1 flex items-center justify-center"
	>
		<TabAnchor href="/" selected={$page.url.pathname === '/'} class="mr-1.5 p-0.5">
			<span>Products</span>
		</TabAnchor>
		<TabAnchor
			href={pillUrl}
			selected={$page.url.pathname === '/dashboard' ||
				$page.url.pathname === '/dashboard/favourites' ||
				$page.url.pathname === '/dashboard/myreviews' ||
				$page.url.pathname === '/dashboard/account'}
			class="p-0.5"
			on:click={() => {
				if (!loggedIn) {
					login();
				}
			}}
		>
			<span>Dashboard</span>
		</TabAnchor>
	</TabGroup>

	<!-- Profile and location -->
	<div class="sm:w-46 flex items-center justify-end">
		<LightSwitch class="hidden sm:block bg-surface-100-800-token shadow-xl" />
		<button on:click={changeLOcationState} class="relative">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="w-6 h-6 mx-1.5 cursor-pointer hidden sm:block icon-shadow"
				viewBox="0 0 24 24"
				><g
					fill="none"
					stroke={color}
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					><path
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0"
					/><path d="M15 11a3 3 0 1 1-6 0a3 3 0 0 1 6 0" /></g
				></svg
			>
		</button>
		<div use:popup={loggedIn ? loggedInDropdown : guestDropdown}>
			{#if !loggedIn}
				<div
					class="bg-surface-100-800-token border-2 border-surface-300-600-token hover:!border-primary-500 rounded-full h-10 w-10 hidden sm:flex items-center justify-center p-1 cursor-pointer transition-all duration-300 ease-in-out"
				>
					<UserIcon class="w-6 h-6" />
				</div>
				<div class="sm:hidden btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer">
					<HamburgerIcon class="w-6 h-6" />
				</div>
				<!-- Dropdown Guest -->
				<div data-popup="guestDropdown">
					<div
						class="bg-surface-100-800-token border border-surface-300-600-token rounded-4xl shadow-xl w-44"
					>
						<div class="p-2 sm:hidden">
							<div class="w-full p-2 flex justify-around">
								<LightSwitch class="variant-filled-surface" />
								<button on:click={changeLOcationState} class="relative">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-6 h-6 mx-1.5 cursor-pointer icon-shadow"
										viewBox="0 0 24 24"
										><g
											fill="none"
											stroke={color}
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											><path
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0"
											/><path d="M15 11a3 3 0 1 1-6 0a3 3 0 0 1 6 0" /></g
										></svg
									>
								</button>
							</div>
						</div>
						<div class="p-2">
							<button
								on:click={login}
								class="btn btn-md variant-filled-surface rounded-4xl cursor-pointer w-full"
								>Sign in</button
							>
						</div>
						<div class="p-2">
							<button
								on:click={register}
								class="btn btn-md variant-filled-primary w-full rounded-4xl cursor-pointer"
								>Create account</button
							>
						</div>
					</div>
					<div class="arrow bg-surface-100-800-token border-l border-t border-surface-400-500-token" />
				</div>
			{:else}
				<div class="hidden sm:flex items-center justify-center cursor-pointer">
					<div class="buttonfix md:mr-1.5 flex">
						<Avatar
							{initials}
							class=" hover:!border-primary-500 shadow-xl transition-all duration-300 ease-in-out "
							background="bg-surface-100-800-token"
							border="border-2 border-surface-200-700-token"
						/>
					</div>

					<span class="truncate hidden md:block text-shadow text-white">{username}</span>
				</div>
				<div class="sm:hidden btn-icon btn-icon-md bg-surface-100-800-token cursor-pointer">
					<HamburgerIcon class="w-6 h-6" />
				</div>
				<!-- Dropdown User -->
				<div data-popup="loggedInDropdown">
					<div
						class="bg-surface-100-800-token border border-surface-500 shadow-xl w-44 rounded-4xl p-2"
					>
						<div class="p-2 sm:hidden">
							<div class="w-full p-2 flex justify-around">
								<LightSwitch class="variant-filled-surface" />
								<button on:click={changeLOcationState} class="relative">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-6 h-6 mx-1.5 cursor-pointer icon-shadow"
										viewBox="0 0 24 24"
										><g
											fill="none"
											stroke={color}
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											><path
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0"
											/><path d="M15 11a3 3 0 1 1-6 0a3 3 0 0 1 6 0" /></g
										></svg
									>
								</button>
							</div>
						</div>
						<div class="mb-2 px-4 py-3 text-sm text-center variant-ghost-surface rounded-4xl">
							<div class="font-medium truncate md:hidden">{username}</div>
							<div class="font-medium truncate">{email}</div>
						</div>
						<ul class="text-sm" aria-labelledby="dropdownInformationButton">
							<li>
								<div class="py-2">
									{#if $page.url.pathname === '/dashboard/myreviews'}
										<a
											href="/dashboard/myreviews"
											class="btn btn-md variant-filled-tertiary flex rounded-4xl shadow-xl"
										>
											My reviews
										</a>
									{:else}
										<a
											href="/dashboard/myreviews"
											class="btn btn-md variant-filled-surface flex rounded-4xl shadow-xl"
										>
											My reviews
										</a>
									{/if}
								</div>
							</li>
							<li>
								<div class="py-2">
									{#if $page.url.pathname === '/dashboard/favourites'}
										<a
											href="/dashboard/favourites"
											class="btn btn-md variant-filled-tertiary flex rounded-4xl shadow-xl"
										>
											Favourites
										</a>
									{:else}
										<a
											href="/dashboard/favourites"
											class="btn btn-md variant-filled-surface flex rounded-4xl shadow-xl"
										>
											Favourites
										</a>
									{/if}
								</div>
							</li>
							<li>
								<div class="py-2">
									{#if $page.url.pathname === '/dashboard/account'}
										<a
											href="/dashboard/account"
											class="btn btn-md variant-filled-tertiary flex rounded-4xl shadow-xl"
										>
											Account
										</a>
									{:else}
										<a
											href="/dashboard/account"
											class="btn btn-md variant-filled-surface flex rounded-4xl shadow-xl"
										>
											Account
										</a>
									{/if}
								</div>
							</li>
						</ul>
						<div class="pt-2">
							<a
								href="/logout"
								data-sveltekit-preload-data="tap"
								on:click={() => {
									loggedIn = false;
									$user = null;
									$cards = 'all products';
									(async () => {
										try {
											await fetchCards();
										} catch (error) {
											console.error(error);
										}
									})();
								}}
								class="btn btn-md variant-filled-primary flex rounded-4xl shadow-xl"
							>
								Sign out
							</a>
						</div>
					</div>
					<div class="arrow bg-surface-100-800-token border-l border-t border-surface-400-500-token" />
				</div>
			{/if}
		</div>
	</div>
</nav>

<style>
	.text-shadow {
		text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
	}

	.icon-shadow {
		filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.5));
	}

	.buttonfix {
		width: 43px;
		height: 43px;
	}
</style>
