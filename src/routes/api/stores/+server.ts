import type { RequestHandler } from './$types';
import { getStores } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') ?? '0');
	const limit = 1;
	const offset = page * limit;

	try {
		console.log('Stores api: ', url.searchParams);
		const results = await getStores(offset, limit);
		return new Response(JSON.stringify(results));
	} catch (error) {
		return new Response(JSON.stringify({ stores: [], total: 0, error: 'Error retrieving stores. Please try again later.' }), { status: 500 });
	}
};
