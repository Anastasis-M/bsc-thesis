import type { RequestHandler } from './$types';
import { getAutocompleteSuggestions } from '$lib/db';
import { checkToken } from '$lib/db';

export const GET: RequestHandler = async ({ url, cookies }) => {
	console.log('Fetching autocomplete suggestions for', url.searchParams);
	try {
		const searchTerm = url.searchParams.get('suggestionsFor') ?? '';
		const type = url.searchParams.get('type');
		const locationString = url.searchParams.get('location') ?? '';
		const cardsType = url.searchParams.get('cardsType') ?? 'all products';
		const token = cookies.get('token');
		let userId = await checkToken(token);

		if (!userId) {
			userId = 'guest';
		}

		if (searchTerm === '') {
			return new Response(JSON.stringify({ suggestions: [] }), {});
		}

		if (type !== 'products' && type !== 'stores') {
			return new Response(JSON.stringify({ error: 'Invalid type' }), {
				status: 400
			});
		}

		const locationPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
		if (type === 'stores') {
			if (!locationPattern.test(locationString)) {
				const suggestions = await getAutocompleteSuggestions(searchTerm, type, '', userId, cardsType);
				return new Response(JSON.stringify({ suggestions }));
			}
		}

		const suggestions = await getAutocompleteSuggestions(searchTerm, type, locationString, userId, cardsType);
		return new Response(JSON.stringify({ suggestions }));
	} catch (error) {
		return new Response(
			JSON.stringify({ suggestions: [], error: 'Error getting autocomplete suggestions' }),
			{
				status: 500
			}
		);
	}
};
