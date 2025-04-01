import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { message, superValidate, fail } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';
import {
	getCardById,
	getUserDisplayInfo,
	checkToken,
	likeOrDislikeProduct,
	getUserInfoByUserId,
	checkCredentials,
	getImagesByReviewId,
	getReviewsByCardId,
	likeOrDislikeReview,
	createNewReview,
	checkStore
} from '$lib/db';

const loginSchema = z.object({
	email: z.string().email().min(3).max(50),
	password: z.string().min(8).max(50)
});

const uploadReviewSchema = z.object({
	productName: z
		.string()
		.min(2, 'Product name must be at least 2 characters long')
		.max(100, 'Product name must be less than 100 characters'),
	category: z.number().min(1, 'Choose a valid category').max(4, 'Choose a valid category'),
	store: z
		.string()
		.min(2, 'Store name must be at least 2 characters long')
		.max(100, 'Store name must be less than 100 characters'),
	storeId: z.string(),
	price: z
		.number()
		.min(0.01, 'Price must be between 0.01 and 1000000')
		.max(1000000, 'Price must be between 0.01 and 1000000'),
	rating: z
		.number()
		.min(1, 'Rating must be between 1 and 5')
		.max(5, 'Rating must be between 1 and 5'),
	reviewText: z
		.string()
		.min(5, 'Review text must be at least 5 characters long')
		.max(1000, 'Review text must be less than 1000 characters'),
	reviewImages: z
		.instanceof(File, { message: 'Please upload an image' })
		.refine((f) => f.size < 5000000, 'Max file size is 5MB')
		.array()
		.min(1, 'Please upload at least one image')
		.max(5, 'You can upload up to 5 images')
		.default([]),
	location: z
		.string()
});

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
	const loginForm = await superValidate(zod(loginSchema));
	const uploadReviewForm = await superValidate(zod(uploadReviewSchema));
	const cardId = parseInt(params.id);
	const token = cookies.get('token');
	try {
		let userId = await checkToken(token);
		if (!userId) {
			userId = 'guest';
		}
		const res = await getCardById(cardId, userId);
		if (!res) {
			return {
				loginForm,
				uploadReviewForm,
				card: false,
				error: 'Error retrieving product data'
			};
		}
		locals.card = res;

		const { paginatedReviews, total } = await getReviewsByCardId(cardId, 2, 0, userId);
		locals.card.reviews = paginatedReviews;
		locals.card.totalReviews = total;
		locals.card.reviews = await Promise.all(
			locals.card.reviews.map(async (review) => {
				try {
					review.user = await getUserDisplayInfo(review.user_id);
					review.images = await getImagesByReviewId(review.id);
					return review;
				} catch (error) {
					throw error;
				}
			})
		);

		locals.card.reviews.sort((a, b) => {
			const aHelpfulScore = a.helpful_votes / a.total_votes;
			const bHelpfulScore = b.helpful_votes / b.total_votes;
			return bHelpfulScore - aHelpfulScore;
		});

		return { card: locals.card, loginForm, uploadReviewForm };
	} catch (error) {
		return {
			loginForm,
			uploadReviewForm,
			card: false
		};
	}
};

export const actions = {
	login: async ({ request, cookies, locals }) => {
		const loginForm = await superValidate(request, zod(loginSchema));
		console.log('POST', loginForm);

		if (!loginForm.valid) {
			return fail(400, {
				loginForm
			});
		}

		const email = loginForm.data.email;
		const password = loginForm.data.password;

		let token = uuidv4();

		if (!(await checkCredentials(email, password, token))) {
			return message(loginForm, 'Wrong email or password!', {
				status: 400
			});
		}

		let user_id = locals.user_id;
		let role = locals.role;
		if (user_id) {
			try {
				const user = await getUserInfoByUserId(user_id);
				locals.userInfo = {
					id: user_id,
					role: role,
					display_name: user.display_name,
					email: user.email
				};
			} catch (error) {
				return message(loginForm, 'Something went wrong!', {
					status: 500
				});
			}
		}

		cookies.set('token', token, {
			path: '/',
			maxAge: 60 * 60 * 24,
			sameSite: true,
			httpOnly: true
		});

		return message(loginForm, 'You are now logged in!', {
			user: locals.userInfo
		});
	},

	uploadReview: async ({ request, cookies }) => {
		const uploadReviewForm = await superValidate(request, zod(uploadReviewSchema));
		console.log('POST', uploadReviewForm);

		if (!uploadReviewForm.valid) {
			return fail(400, {
				uploadReviewForm
			});
		}
		let userId;
		const token = cookies.get('token');

		if (!token) {
			return message(uploadReviewForm, 'You are not logged in!', {
				status: 401
			});
		} else {
			userId = await checkToken(token);
			if (!userId) {
				return message(uploadReviewForm, 'You are not logged in!', {
					status: 401
				});
			}
		}

		const productName = uploadReviewForm.data.productName;
		const storeMapsId = uploadReviewForm.data.storeId;
		const store = uploadReviewForm.data.store.split(' - ')[0];
		const storeAdressLabel = uploadReviewForm.data.store.split(' - ')[1];
		let providedLocation = uploadReviewForm.data.location ?? '';

		const locationPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
		if (!providedLocation.match(locationPattern) || providedLocation.includes('undefined') || providedLocation.includes('null')) {
			providedLocation = '';
		}
		let storeId, checkedStoreMapsId, storeName, storeAddress, storeLocation;
		try {
			const storeData = await checkStore(storeMapsId);
			if (storeData === false) {
				return message(uploadReviewForm, 'Store does not exist!', {
					status: 400
				});
			}
			const { store_id, maps_id, title, address, position } = storeData;
			storeId = store_id;
			storeName = title;
			storeAddress = address;
			storeLocation = position;
			checkedStoreMapsId = maps_id;
			console.log({ storeId, maps_id, storeName, storeAddress, storeLocation, checkedStoreMapsId });
		} catch (error) {
			return message(uploadReviewForm, 'Error while checking store', {
				status: 500
			});
		}
		const category = uploadReviewForm.data.category;
		const price = uploadReviewForm.data.price;
		const rating = uploadReviewForm.data.rating;
		const reviewText = uploadReviewForm.data.reviewText;
		const reviewImages = uploadReviewForm.data.reviewImages;

		console.log({
			userId,
			productName,
			category,
			storeId,
			checkedStoreMapsId,
			storeName,
			storeAddress,
			storeLocation,
			price,
			rating,
			reviewText,
			reviewImages: uploadReviewForm.data.reviewImages
		});

		let reviewImagesFileNames = [];
		for (let i = 0; i < reviewImages.length; i++) {
			const reviewImage = reviewImages[i];
			reviewImagesFileNames.push(uuidv4() + reviewImage.name);
		}

		try {
			await createNewReview(
				userId,
				productName,
				category,
				storeId,
				checkedStoreMapsId,
				storeName,
				storeAddress,
				storeLocation,
				price,
				rating,
				reviewText,
				reviewImagesFileNames,
				reviewImages
			);
		} catch (error) {
			return message(uploadReviewForm, 'Error uploading review!', {
				toast: {
					message: 'Error uploading review!',
					background: 'variant-filled-error'
				},
				status: 500
			});
		}

		return message(uploadReviewForm, 'Review uploaded!', {
			toast: {
				message: 'Review uploaded!',
				background: 'variant-filled-success'
			}
		});
	},

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
					const message = await likeOrDislikeProduct(userId, cardId);
					return {
						toast: {
							message: message,
							background: 'variant-filled-success'
						},
						status: 200
					};
				} catch (error) {
					return {
						toast: {
							message: 'Error liking or disliking product!',
							background: 'variant-filled-warning'
						},
						status: 500
					};
				}
			}
		}
	},

	likeReview: async ({ request, cookies }) => {
		const data = await request.formData();
		const reviewId = data.get('review_id');
		const like = data.get('like');
		const token = cookies.get('token');

		if (!token) {
			return {
				toast: {
					message: 'You are not logged in!',
					background: 'variant-filled-warning'
				},
				status: 400
			};
		} else {
			const userId = await checkToken(token);
			if (!userId) {
				return {
					toast: {
						message: 'You are not logged in!',
						background: 'variant-filled-warning'
					},
					status: 400
				};
			} else {
				try {
					const message = await likeOrDislikeReview(userId, reviewId, like);
					return {
						status: 200,
						toast: {
							message: message,
							background: 'variant-filled-success'
						}
					};
				} catch (error) {
					return {
						status: 500,
						toast: {
							message: 'Error liking or disliking review!',
							background: 'variant-filled-error'
						}
					};
				}
			}
		}
	}
} satisfies Actions;
