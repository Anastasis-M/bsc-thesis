import type { RequestHandler } from './$types';
import { getUserDisplayInfo } from '$lib/db';
import { getReviewsByCardId } from '$lib/db';
import { getImagesByReviewId } from '$lib/db';
import { checkToken } from '$lib/db';
import { getCardIsFavourite } from '$lib/db';

export const GET: RequestHandler = async ({ url, cookies, params }) => {
	try {
		console.log('Product api: ', url.searchParams);
		const card_id = parseInt(params.id);
		const page = parseInt(url.searchParams.get('page') ?? '0');
		const limit = 2;
		const offset = page * limit;

		const token = cookies.get('token');
		let userId = await checkToken(token);
		if (!userId) {
			userId = 'guest';
		}

		let isFavourite = false;
		if (userId !== 'guest') {
			isFavourite = await getCardIsFavourite(card_id, userId);
		}

		let { paginatedReviews, total } = await getReviewsByCardId(card_id, limit, offset, userId);

		paginatedReviews.sort((a, b) => {
			const aHelpfulScore = a.helpful_votes / a.total_votes;
			const bHelpfulScore = b.helpful_votes / b.total_votes;
			return bHelpfulScore - aHelpfulScore;
		});

		paginatedReviews = await Promise.all(
			paginatedReviews.map(async (review) => {
				review.user = await getUserDisplayInfo(review.user_id);
				review.images = await getImagesByReviewId(review.id);
				return review;
			})
		);

		return new Response(JSON.stringify({ paginatedReviews, total, isFavourite }));
	} catch (error) {
		return new Response(
			JSON.stringify({
				paginatedReviews: [],
				total: 0,
				isFavourite: false,
				error: 'Error retrieving product data. Please try again later.'
			}),
			{
				status: 500
			}
		);
	}
};
