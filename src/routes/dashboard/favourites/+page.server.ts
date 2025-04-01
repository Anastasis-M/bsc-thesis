import type { PageServerLoad } from './$types';
import { likeOrDislikeProduct, checkToken } from '$lib/db';
import type { Actions } from './$types';

export const load = (async ({ cookies }) => {
	const token = cookies.get('token');
	if (!token) {
		return {
			toast: {
				message: 'You are not logged in!',
				background: 'variant-filled-warning'
			},
			status: 401
		};
	} else {
		const userId = await checkToken(token);
		if (!userId) {
			return {
				toast: {
					message: 'You are not logged in!',
					background: 'variant-filled-warning'
				},
				status: 401
			};
		}
	}
	return {};
}) satisfies PageServerLoad;

/** @type {import('./$types').Actions} */
export const actions = {
	likeProduct: async ({ request, cookies }) => {
		const data = await request.formData();
		const cardId = data.get('cardId');
		if (cardId === null || parseInt(cardId) < 0 || isNaN(parseInt(cardId)) || !cardId) {
			return {
				toast: {
					message: 'Invalid card ID',
					background: 'variant-filled-warning'
				},
				status: 400
			};
		}

		const token = cookies.get('token');
		if (!token) {
			return {
				toast: {
					message: 'You are not logged in!',
					background: 'variant-filled-warning'
				},
				status: 401
			};
		} else {
			const userId = await checkToken(token);
			if (!userId) {
				return {
					toast: {
						message: 'You are not logged in!',
						background: 'variant-filled-warning'
					},
					status: 401
				};
			} else {
				try {
					await likeOrDislikeProduct(userId, cardId);
					return {
						toast: {
							message: 'Product removed from favourites!',
							background: 'variant-filled-success'
						},
						status: 200
					};
				} catch (error) {
					return {
						toast: {
							message: 'Error removing product from favourites!',
							background: 'variant-filled-error'
						},
						status: 500
					};
				}
			}
		}
	}
} satisfies Actions;
