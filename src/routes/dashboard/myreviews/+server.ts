import type { RequestHandler } from './$types';
import { getUserReviews } from '$lib/db';
import { checkToken } from '$lib/db';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		console.log('Searching or fetching reviews', url.searchParams);
		const token = cookies.get('token');
		const userId = await checkToken(token);
		if (!userId) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		}

		const page = parseInt(url.searchParams.get('_page') ?? '1');
		let limit = parseInt(url.searchParams.get('_limit') ?? '2');
		if (limit > 100 || limit < 1) {
			return new Response(JSON.stringify({ reviews: [], total: 0, error: 'Invalid limit' }), {
				status: 400
			});
		}
		const offset = (page - 1) * limit;
		const sortBy = url.searchParams.get('_sort') ?? '';
		const sortOrder = url.searchParams.get('_order') ?? 'asc';
		const searchTerm = url.searchParams.get('q') ?? '';
		const filters = ['product_name', 'store_name', 'rating', 'review_text', 'review_date', 'price'];
		let filterValue;
		let filterBy;
		for (const filter of filters) {
			filterValue = url.searchParams.get(filter) ?? '';
			if (filterValue) {
				filterBy = filter;
				break;
			}
		}
		const reviews = await getUserReviews({
			userId,
			limit,
			offset,
			sortBy,
			sortOrder,
			searchTerm,
			filterBy,
			filterValue
		});
		return new Response(JSON.stringify(reviews));
	} catch (error) {
		return new Response(
			JSON.stringify({
				reviews: [],
				total: 1,
				error: 'Error retrieving reviews. Please try again later.'
			}),
			{
				status: 500
			}
		);
	}
};
