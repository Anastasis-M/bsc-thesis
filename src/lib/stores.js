import { writable } from 'svelte/store';
export let sortingOptions = writable([
	{
		name: 'Rating',
		sortOrder: ''
	},
	{
		name: 'Price',
		sortOrder: ''
	},
	{
		name: 'Alphabetical',
		sortOrder: ''
	},
	{
		name: 'Location',
		sortOrder: ''
	}
]);

export let categorizationOptions = writable([
	{
		name: 'All products',
		enabled: true
	},
	{
		name: 'Technology',
		enabled: false
	},
	{
		name: 'Home-Garden',
		enabled: false
	},
	{
		name: 'Fashion',
		enabled: false
	},
	{
		name: 'Office',
		enabled: false
	}
]);


export let user = writable();
export let total = writable(0);
export let paginationLimit = writable(2);
export let cards = writable('all products');
export let cardsInDashboard = writable('favorites');
export let paginatedCards = writable([]);
export let pageNum = writable(0);
export let sortBy = writable('');
export let sortOrder = writable('');
export let searchTerm = writable('');
export let storeSearchTerm = writable('');
export let location = writable({});
export let storeId = writable('');

export let productRefreshState = writable(false);
export let reviewRefreshState = writable(false);
export let favoritesRefreshState = writable(false);

