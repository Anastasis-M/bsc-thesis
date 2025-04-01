import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate, fail } from 'sveltekit-superforms';
import { checkToken, editReviewText, getUserReviews } from '$lib/db';

const editReviewTextSchema = z.object({
	reviewId: z.number().min(1, 'Invalid review id').max(1000000, 'Invalid review id'),
	reviewText: z
		.string()
		.min(5, 'Review text must be at least 5 characters long')
		.max(1000, 'Review text must be less than 1000 characters')
});

export const load: PageServerLoad = async ({cookies}) => {
	const editReviewTextForm = await superValidate(zod(editReviewTextSchema));
	const token = cookies.get('token');
		if (!token) {
			return {
				editReviewTextForm: editReviewTextForm,
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
					editReviewTextForm: editReviewTextForm,
					toast: {
						message: 'You are not logged in!',
						background: 'variant-filled-warning'
					},
					status: 401
				};
			}
		}
	return { editReviewTextForm };
};

/** @type {import('./$types').Actions} */
export const actions = {
	editReviewText: async ({ request, cookies }) => {
		const editReviewTextForm = await superValidate(request, zod(editReviewTextSchema));

		if (!editReviewTextForm.valid) {
			return fail(400, {
				editReviewTextForm
			});
		}

		const reviewId = editReviewTextForm.data.reviewId;
		const reviewText = editReviewTextForm.data.reviewText;
		console.log('editReviewText', reviewId, reviewText);

		const token = cookies.get('token');
		if (!token) {
			return message(editReviewTextForm, 'You are not logged in!', {
				status: 401
			});
		} else {
			const userId = await checkToken(token);
			if (!userId) {
				return message(editReviewTextForm, 'You are not logged in!', {
					status: 401
				});
			} else {
				try {
					await editReviewText(userId, reviewId, reviewText);
					return message(editReviewTextForm, 'Review edited successfully!', {
						toast: {
							message: 'Review edited successfully!',
							background: 'variant-filled-success'
						}
					});
				} catch (error) {
					return message(editReviewTextForm, 'Error editing review!', {
						toast: {
							message: 'Error editing review!',
							background: 'variant-filled-error'
						},
						status: 500
					});
				}
			}
		}
	}
} satisfies Actions;
