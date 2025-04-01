<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Drawer } from '@skeletonlabs/skeleton';
	import { Toast } from '@skeletonlabs/skeleton';
	import { Modal } from '@skeletonlabs/skeleton';
	import LoginFormModal from '$lib/components/LoginFormModal.svelte';
	import RegisterFormModal from '$lib/components/RegisterFormModal.svelte';
	import UploadReviewModal from '$lib/components/UploadReviewModal.svelte';
	import FiltersModal from '$lib/components/FiltersModal.svelte';
	import ReviewMainCardModal from '$lib/components/ReviewMainCardModal.svelte';
	import EditReviewTextModal from '$lib/components/EditReviewTextModal.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { user } from '$lib/stores';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();

	const modalRegistry: Record<string, ModalComponent> = {
		loginModal: { ref: LoginFormModal },
		registerModal: { ref: RegisterFormModal },
		uploadReviewModal: { ref: UploadReviewModal },
		filtersModal: { ref: FiltersModal },
		reviewMainCardModal: { ref: ReviewMainCardModal },
		editReviewTextModal: { ref: EditReviewTextModal }
	};

	$user = $page.data.user;
</script>

<Modal components={modalRegistry} class="overflow-y-scroll" />
<Drawer>
	<Sidebar margin="mx-0" padding="pb-0" appearance="flex" intent="drawer" />
</Drawer>
<Toast rounded="rounded-4xl" />
<AppShell>
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Sidebar />
	</svelte:fragment>
	<slot />
</AppShell>
