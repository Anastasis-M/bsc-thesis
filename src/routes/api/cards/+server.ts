import type { RequestHandler } from './$types';
import { getProductsCards, checkToken } from '$lib/db';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		console.log('Cards api: ', url.searchParams);
		const searchTerm = url.searchParams.get('search') ?? '';
		let sortBy = url.searchParams.get('sortBy') ?? '';
		let sortOrder = url.searchParams.get('sortOrder') ?? 'asc';
		const cards = url.searchParams.get('cards') ?? 'all products';
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

		const token = cookies.get('token');
		let userId = await checkToken(token);
		if (!userId) {
			userId = 'guest';
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
		return new Response(
			JSON.stringify({
				paginatedCards: [],
				total: 0,
				error: 'Error retrieving products. Please try again later.'
			}),
			{
				status: 500
			}
		);
	}
};
