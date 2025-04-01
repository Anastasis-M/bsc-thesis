import type { RequestHandler } from './$types';
import { getProductsCards } from '$lib/db';
import { checkToken } from '$lib/db';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		console.log('Favourites api: ',url.searchParams);
		const token = cookies.get('token');
		const userId = await checkToken(token);
		if (!userId) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		}
		
		const searchTerm = url.searchParams.get('search') ?? '';
		let sortBy = url.searchParams.get('sortBy') ?? '';
		let sortOrder = url.searchParams.get('sortOrder') ?? 'asc';
		const cards = 'favorites';
		const page = parseInt(url.searchParams.get('page') ?? '0');
		const limit = 10;
		const offset = page * limit;
		let locationString = url.searchParams.get('location') ?? 'a,a';
		const storeId = parseInt(url.searchParams.get('storeId') ?? '0');

		const locationPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
		if (sortBy === 'Location') {
			if (
				!locationPattern.test(locationString) 
			) {
				return new Response(
					JSON.stringify({
						paginatedCards: [],
						total: 0,
						error: 'Location is not valid or not provided, please try again.'
					}),
					{
						status: 400
					}
				);
			}
		}

		const { paginatedCards, total } = await getProductsCards(
			cards,
			sortBy,
			sortOrder,
			userId,
			limit,
			offset,
			searchTerm,
			locationString,
			storeId
		);
		return new Response(JSON.stringify({ paginatedCards, total }));
	} catch (error) {
		return new Response(JSON.stringify({paginatedCards: [], total: 0 ,error: 'Error retrieving saved products. Please try again later.' }), {
			status: 500
		});
	}
};