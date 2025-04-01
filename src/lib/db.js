import bcrypt from 'bcrypt';
import { writeFileSync } from 'fs';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Connect to the database
async function connectToDB() {
	await prisma.$connect();
}
export { connectToDB };

// Disconnect from the database
async function disconnectFromDB() {
	await prisma.$disconnect();
}
export { disconnectFromDB };

// User creation
async function createUser(email, password, fullname, token) {
	try {
		const existingUser = await prisma.users.findUnique({
			where: {
				email: email
			}
		});

		if (existingUser) {
			return { success: false, error: 'Email address already exists' };
		}

		const newUser = await prisma.users.create({
			data: {
				email: email,
				password: password,
				role: 'user',
				display_name: fullname
			}
		});

		await prisma.tokens.create({
			data: {
				user_id: newUser.id,
				token_value: token
			}
		});

		return { success: true, id: newUser.id };
	} catch (error) {
		console.error('Error creating user:', error);
		throw new Error('Error creating user');
	}
}
export { createUser };

// Check credentials for login and delete old tokens if login is successful, then create new token
async function checkCredentials(email, password, token) {
	try {
		const user = await prisma.users.findUnique({
			where: {
				email: email
			}
		});

		if (!user) {
			return false;
		}

		const result = await bcrypt.compare(password, user.password);
		if (result) {
			await prisma.tokens.deleteMany({
				where: {
					user_id: user.id
				}
			});
			await prisma.tokens.create({
				data: {
					user_id: user.id,
					token_value: token
				}
			});
			return true;
		}

		return false;
	} catch (error) {
		console.error('Error checking credentials:', error);
		throw error;
	}
}
export { checkCredentials };

// Check if token is valid and if it is return user id
async function checkToken(token) {
	try {
		const tokenRecord = await prisma.tokens.findFirst({
			where: {
				token_value: token
			}
		});
		if (!tokenRecord) {
			return false;
		}
		return tokenRecord.user_id;
	} catch (error) {
		console.error('Error checking token:', error);
		throw error;
	}
}
export { checkToken };

// Get user role by user id
async function getUserRole(userId) {
	try {
		const user = await prisma.users.findUnique({
			where: {
				id: userId
			},
			select: {
				role: true
			}
		});

		if (!user) {
			return false;
		}

		return user.role;
	} catch (error) {
		console.error('Error getting user role:', error);
		throw error;
	}
}
export { getUserRole };

// Get fullname, email by user id
async function getUserInfoByUserId(userId) {
	try {
		const user = await prisma.users.findUnique({
			where: {
				id: userId
			},
			select: {
				email: true,
				display_name: true
			}
		});

		if (!user) {
			return false;
		}

		const { email, display_name } = user;

		return { email, display_name };
	} catch (error) {
		console.error('Error getting user info:', error);
		throw error;
	}
}
export { getUserInfoByUserId };

// Find user_id from token and delete token
async function logout(token) {
	try {
		const tokenRecord = await prisma.tokens.findFirst({
			where: {
				token_value: token
			}
		});

		if (!tokenRecord) {
			return false;
		}

		const userId = tokenRecord.user_id;

		await prisma.tokens.deleteMany({
			where: {
				user_id: userId
			}
		});

		return true;
	} catch (error) {
		console.error('Error logging out:', error);
		throw error;
	}
}
export { logout };

// Create review
async function createNewReview(
	userId,
	productName,
	category,
	storeID,
	storeMapsId,
	storeName,
	storeAddress,
	storeLocation,
	price,
	rating,
	reviewText,
	reviewImagesFileNames,
	reviewImages
) {
	try {
		await prisma.$transaction(async (prisma) => {
			const productIdResult = await prisma.products.findFirst({
				where: {
					name: productName
				},
				select: {
					id: true
				}
			});

			let productId;
			if (!productIdResult) {
				productId = null;
			} else {
				productId = productIdResult.id;
			}

			let storeId = storeID;
			console.log('Store location', storeLocation)
			let store_location = `(${storeLocation.lat}, ${storeLocation.lng})`; //{ lat: 37.98848, lng: 23.72858 }
			console.log('Ids:', productId, storeId, store_location);

			// Check if the product already exists based on combination of the 2 ids
			let cardId;
			let existingProduct = [];
			if (productId == null || storeId == null) {
				existingProduct = [];
			} else {
				existingProduct = await prisma.cards.findMany({
					where: {
						product_id: productId,
						store_id: storeId
					}
				});
				console.log('existing product:', existingProduct);
				cardId = existingProduct[0].id;
				console.log('card id:', cardId);
			}

			if (existingProduct.length > 0) {
				// If the product already exists, reuse the existing product ID
				productId = existingProduct[0].product_id;
				console.log('Existing product Ids:', productId, storeId);
			} else if (productId == null && storeId == null) {
				// Add the new product to the products table
				const productResult = await prisma.products.create({
					data: {
						name: productName,
						category: category
					},
					select: {
						id: true
					}
				});
				productId = productResult.id;

				// Add the new store to the stores table, using the last added location id
				const storeResult =
					await prisma.$queryRaw`INSERT INTO stores (name, maps_id, address, position) VALUES (${storeName}, ${storeMapsId}, ${storeAddress}, POINT(${store_location})) RETURNING id`;
				console.log('store result:', storeResult);
				storeId = storeResult[0].id;

				// Add the new product to the cards table
				const cardResult = await prisma.cards.create({
					data: {
						product_id: productId,
						store_id: storeId,
						category_id: category,
						product_name: productName,
						store_name: storeName,
						number_of_reviews: 0
					},
					select: {
						id: true
					}
				});
				cardId = cardResult.id;
			} else if (productId == null) {
				// Add the new product to the products table
				const productResult = await prisma.products.create({
					data: {
						name: productName,
						category: category
					},
					select: {
						id: true
					}
				});
				productId = productResult.id;

				// Add the new product to the cards table
				const cardResult = await prisma.cards.create({
					data: {
						product_id: productId,
						store_id: storeId,
						category_id: category,
						product_name: productName,
						store_name: storeName,
						number_of_reviews: 0
					},
					select: {
						id: true
					}
				});
				cardId = cardResult.id;
			} else if (storeId == null) {
				// Add the new store to the stores table, using the last added location id
				await prisma.$queryRaw`INSERT INTO stores (name, maps_id, address, position) VALUES (${storeName}, ${storeMapsId}, ${storeAddress}, POINT(${store_location}))`;

				// Get the store id
				const storeResult = await prisma.stores.findFirst({
					where: {
						name: storeName,
						address: storeAddress
					},
					select: {
						id: true
					}
				});
				storeId = storeResult.id;

				// Get category id of the product
				const categoryResult = await prisma.products.findUnique({
					where: {
						id: productId
					},
					select: {
						category: true
					}
				});
				category = categoryResult.category;

				// Add the new product to the cards table
				const cardResult = await prisma.cards.create({
					data: {
						product_id: productId,
						store_id: storeId,
						category_id: category,
						product_name: productName,
						store_name: storeName,
						number_of_reviews: 0
					},
					select: {
						id: true
					}
				});
				cardId = cardResult.id;
			}
			// Add the new review to the reviews table
			const reviewResult = await prisma.reviews.create({
				data: {
					user_id: userId,
					product_id: productId,
					store_id: storeId,
					price: price,
					rating: rating,
					review_text: reviewText
				},
				select: {
					id: true
				}
			});
			const reviewId = reviewResult.id;
			console.log('review id:', reviewId);

			// Update the card to include the new review ID
			await prisma.cards.update({
				where: {
					id: cardId
				},
				data: {
					review_ids: {
						push: reviewId
					}
				}
			});

			// Update the number of reviews for the card that the product belongs to
			await prisma.cards.update({
				where: {
					id: cardId
				},
				data: {
					number_of_reviews: {
						increment: 1
					}
				}
			});

			// Get the number of reviews for the product
			const numberOfReviewsResult = await prisma.cards.findUnique({
				where: {
					id: cardId
				},
				select: {
					number_of_reviews: true
				}
			});
			let numberOfReviews = numberOfReviewsResult.number_of_reviews;

			// Calculate the new average price and rating for the specific product
			const card = await prisma.cards.findUnique({
				where: { id: cardId },
				select: {
					average_price: true,
					average_rating: true
				}
			});

			const currentAveragePrice = card.average_price || 0; // Use 0 if average_price is null
			let newAveragePrice = (currentAveragePrice * (numberOfReviews - 1) + price) / numberOfReviews;
			newAveragePrice = Math.round(newAveragePrice * 100) / 100;

			const currentAverageRating = card.average_rating || 0; // Use 0 if average_rating is null

			let newAverageRating =
				(currentAverageRating * (numberOfReviews - 1) + rating) / numberOfReviews;
			newAverageRating = Math.round(newAverageRating * 2) / 2;

			await prisma.cards.update({
				where: { id: cardId },
				data: {
					average_price: newAveragePrice,
					average_rating: newAverageRating
				}
			});

			// Add the image names to the images table and associate them with the review id
			for (const imageFileName of reviewImagesFileNames) {
				await prisma.images.create({
					data: {
						review_id: reviewResult.id,
						image_path: imageFileName
					}
				});
			}

			// Get the first image path and add it to the card image_cover_path
			const imageResult = await prisma.images.findMany({
				where: {
					review_id: reviewResult.id
				},
				select: {
					image_path: true
				}
			});

			await prisma.cards.update({
				where: {
					id: cardId
				},
				data: {
					image_cover_path: imageResult[0].image_path
				}
			});

			// Increment the number of reviews for the user
			await prisma.users.update({
				where: {
					id: userId
				},
				data: {
					number_of_reviews: {
						increment: 1
					}
				}
			});
			console.log('review created successfully, data:', storeId, reviewId, cardId);
		});

		// Store the images in the review_images folder
		for (let i = 0; i < reviewImagesFileNames.length; i++) {
			const reviewImage = reviewImages[i];
			writeFileSync(
				`review_images/${reviewImagesFileNames[i]}`,
				Buffer.from(await reviewImage.arrayBuffer())
			);
		}
	} catch (error) {
		console.error('Error creating new review:', error);
		throw error;
	}
	return true;
}
export { createNewReview };

// Edit the review
async function editReviewText(user_id, reviewId, reviewText) {
	try {
		const review = await prisma.reviews.findUnique({
			where: { id: reviewId },
			select: { user_id: true }
		});

		if (!review || review.user_id !== user_id) {
			throw new Error("You cannot edit someone else's review!");
		}

		await prisma.reviews.update({
			where: { id: reviewId },
			data: { review_text: reviewText }
		});
	} catch (error) {
		console.error('Error editing review:', error);
		throw error;
	}
}

export { editReviewText };

// Get products cards with pagination and sorting/filtering
async function getProductsCards(
	cards,
	sortBy,
	sortOrder,
	userId = 'guest',
	limit,
	offset,
	searchTerm = '',
	location = '',
	storeId = 0
) {
	try {
		let params = { skip: offset, take: limit };
		let paginatedCards, total;
		const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
		if (searchTerm !== '' && cards !== 'favorites') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						},
						orderBy: {
							average_rating: sortDirection
						},
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						},
						orderBy: {
							average_price: sortDirection
						},
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						},
						orderBy: {
							product_name: sortDirection
						},
						...params
					});
					break;
				case 'Location':
					let searchWildcard = '%' + searchTerm + '%';
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.product_name ILIKE ${searchWildcard}
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.product_name ILIKE ${searchWildcard}
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						},
						...params
					});
					break;
			}

			total = await prisma.cards.count({
				where: { product_name: { contains: searchTerm, mode: 'insensitive' } }
			});

			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			} else {
				paginatedCards = paginatedCards || [];
			}
			return { paginatedCards, total };
		} else if (searchTerm !== '' && cards === 'favorites') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							},
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						orderBy: {
							average_rating: sortDirection
						},
						include: {
							favorites: true
						},
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							},
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						orderBy: {
							average_price: sortDirection
						},
						include: {
							favorites: true
						},
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							},
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						orderBy: {
							product_name: sortDirection
						},
						include: {
							favorites: true
						},
						...params
					});
					break;
				case 'Location':
					let searchWildcard = '%' + searchTerm + '%';
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.product_name ILIKE ${searchWildcard}
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.product_name ILIKE ${searchWildcard}
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});

					break;
				default:
					paginatedCards = await prisma.cards.findMany({
						where: {
							product_name: {
								contains: searchTerm,
								mode: 'insensitive'
							},
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						include: {
							favorites: true
						},
						...params
					});
					break;
			}

			total = await prisma.cards.count({
				where: {
					product_name: {
						contains: searchTerm,
						mode: 'insensitive'
					},
					favorites: {
						some: {
							user_id: userId
						}
					}
				}
			});

			paginatedCards = paginatedCards.map((card) => {
				return { ...card, is_favourite: true };
			});
			return { paginatedCards, total };
		}
		if (cards == 'all products') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						orderBy: { average_rating: sortDirection },
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						orderBy: { average_price: sortDirection },
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						orderBy: { product_name: sortDirection },
						...params
					});
					break;
				case 'Location':
					let latitude = location.split(',')[0];
					let longitude = location.split(',')[1];
					//let locationSortingString = `ST_Distance(s.position::geography, ST_MakePoint(${longitude}::double precision, ${latitude}::double precision)::geography)`;

					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${longitude}::double precision, ${latitude}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					ORDER BY
						distance asc, c.product_name asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${longitude}::double precision, ${latitude}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					ORDER BY
						distance desc, c.product_name desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({
						skip: offset,
						take: limit
					});
					break;
			}

			total = await prisma.cards.count({});
			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			}

			return { paginatedCards, total };
		} else if (cards == 'favorites') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: {
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						orderBy: {
							average_rating: sortDirection
						},
						...params
					});

					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: {
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						orderBy: {
							average_price: sortDirection
						},
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: {
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						orderBy: {
							product_name: sortDirection
						},
						...params
					});
					break;
				case 'Location':
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.id IN (SELECT card_id FROM favorites WHERE user_id = ${userId})
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.id IN (SELECT card_id FROM favorites WHERE user_id = ${userId})
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({
						where: {
							favorites: {
								some: {
									user_id: userId
								}
							}
						},
						...params
					});
					break;
			}

			total = await prisma.cards.count({ where: { favorites: { some: { user_id: userId } } } });

			return { paginatedCards, total };
		} else if (cards == 'technology') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 1 },
						orderBy: { average_rating: sortDirection },
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 1 },
						orderBy: { average_price: sortDirection },
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 1 },
						orderBy: { product_name: sortDirection },
						...params
					});
					break;
				case 'Location':
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 1
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 1
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({ where: { category_id: 1 }, ...params });
					break;
			}

			total = await prisma.cards.count({ where: { category_id: 1 } });

			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId,
						cards: {
							category_id: 1
						}
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			}
			return { paginatedCards, total };
		} else if (cards == 'home-garden') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 2 },
						orderBy: { average_rating: sortDirection },
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 2 },
						orderBy: { average_price: sortDirection },
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 2 },
						orderBy: { product_name: sortDirection },
						...params
					});
					break;
				case 'Location':
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 2
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 2
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({ where: { category_id: 2 }, ...params });
			}

			total = await prisma.cards.count({ where: { category_id: 2 } });

			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId,
						cards: {
							category_id: 2
						}
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			}
			return { paginatedCards, total };
		} else if (cards == 'fashion') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 3 },
						orderBy: { average_rating: sortDirection },
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 3 },
						orderBy: { average_price: sortDirection },
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 3 },
						orderBy: { product_name: sortDirection },
						...params
					});
					break;
				case 'Location':
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 3
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 3
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({ where: { category_id: 3 }, ...params });
			}

			total = await prisma.cards.count({ where: { category_id: 3 } });

			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId,
						cards: {
							category_id: 3
						}
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			}
			return { paginatedCards, total };
		} else if (cards == 'office') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 4 },
						orderBy: { average_rating: sortDirection },
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 4 },
						orderBy: { average_price: sortDirection },
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: { category_id: 4 },
						orderBy: { product_name: sortDirection },
						...params
					});
					break;
				case 'Location':
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 4
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.category_id = 4
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({ where: { category_id: 4 }, ...params });
			}

			total = await prisma.cards.count({ where: { category_id: 4 } });

			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId,
						cards: {
							category_id: 4
						}
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			}
			return { paginatedCards, total };
		} else if (cards == 'store') {
			switch (sortBy) {
				case 'Rating':
					paginatedCards = await prisma.cards.findMany({
						where: { store_id: storeId },
						orderBy: { average_rating: sortDirection },
						...params
					});
					break;
				case 'Price':
					paginatedCards = await prisma.cards.findMany({
						where: { store_id: storeId },
						orderBy: { average_price: sortDirection },
						...params
					});
					break;
				case 'Alphabetical':
					paginatedCards = await prisma.cards.findMany({
						where: { store_id: storeId },
						orderBy: { product_name: sortDirection },
						...params
					});
					break;
				case 'Location':
					if (sortOrder === 'asc') {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.store_id = ${storeId}
					ORDER BY
						distance asc
					LIMIT ${limit} OFFSET ${offset};`;
					} else {
						paginatedCards = await prisma.$queryRaw`SELECT
						c.*,
						ST_Distance(ST_MakePoint(s.position[0], s.position[1])::geography, ST_MakePoint(${location.split(',')[1]}::double precision, ${location.split(',')[0]}::double precision)::geography) AS distance
					FROM
						cards c
					INNER JOIN
						stores s ON c.store_id = s.id
					WHERE
						c.store_id = ${storeId}
					ORDER BY
						distance desc
					LIMIT ${limit} OFFSET ${offset};`;
					}

					paginatedCards = paginatedCards.map((card) => {
						return {
							...card,
							average_price: card.average_price.toFixed(2)
						};
					});
					break;
				default:
					paginatedCards = await prisma.cards.findMany({ where: { store_id: storeId }, ...params });
			}

			total = await prisma.cards.count({ where: { store_id: storeId } });

			if (userId !== 'guest') {
				const favourites = await prisma.favorites.findMany({
					where: {
						user_id: userId,
						cards: {
							store_id: storeId
						}
					}
				});
				paginatedCards = paginatedCards.map((card) => {
					const isFavourite = favourites.some((favourite) => favourite.card_id === card.id);
					return { ...card, is_favourite: isFavourite };
				});
			}
			return { paginatedCards, total };
		} else {
			return { paginatedCards: [], total: 0 };
		}
	} catch (error) {
		console.error('Error retrieving product data:', error);
		throw error;
	}
}
export { getProductsCards };

// Check if store is valid
async function checkStore(storeMapsId) {
	try {
		const res = await fetch(
			'https://lookup.search.hereapi.com/v1/lookup?lang=en&id='
				+ storeMapsId
				+ '&apiKey='
				+ import.meta.env.VITE_HERE_API_KEY
		);

		if (!res.ok) {
			return false;
		}
		const returnedData = await res.json();
		const relevantInfo = {
			mapsId: returnedData.id,
			title: returnedData.title,
			address: returnedData.address.label.split(', ').slice(1).join(', '),
			position: returnedData.position
		};
		
		const existingStore = await prisma.stores.findFirst({
			where: {
				maps_id: relevantInfo.mapsId
			}
		});
		
		let storeId;
		if (!existingStore) {
			storeId = null;
		} else {
			storeId = existingStore.id;
		}

		return {
			store_id: storeId,
			maps_id: relevantInfo.mapsId,
			title: relevantInfo.title,
			address: relevantInfo.address,
			position: relevantInfo.position
		};
	} catch (error) {
		console.error('Error store checking:', error);
		throw error;
	}
}
export { checkStore };

async function getAutocompleteSuggestions(
	searchTerm,
	type,
	location,
	user_id = 'guest',
	cards = 'all products'
) {
	if (type === 'products') {
		try {
			let results;
			if (user_id !== 'guest' && cards === 'favorites') {
				results = await prisma.cards.findMany({
					select: {
						product_name: true
					},
					where: {
						product_name: {
							contains: searchTerm,
							mode: 'insensitive'
						},
						favorites: {
							some: {
								user_id: user_id
							}
						}
					},
					take: 10
				});
			} else {
				results = await prisma.cards.findMany({
					select: {
						product_name: true
					},
					where: {
						product_name: {
							contains: searchTerm,
							mode: 'insensitive'
						}
					},
					take: 10
				});
			}
			return results.map((row) => row.product_name).filter((value, index, self) => self.indexOf(value) === index);
		} catch (error) {
			console.error('Error fetching autocomplete suggestions:', error);
			throw error;
		}
	} else if (type === 'stores') {
		try {
			const results = await prisma.stores.findMany({
				select: {
					name: true,
					address: true
				},
				where: {
					name: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				},
				take: 10
			});

			let suggestions = results.map((row) => `${row.name} - ${row.address}`);
			if (suggestions.length < 3) {
				let url;
				if (location === '') {
					url = `https://autosuggest.search.hereapi.com/v1/autosuggest?in=countryCode:GRC&in=circle:37.9838,23.7275;r=1000000&q=${searchTerm}&limit=3&type=place&lang=en&apikey=${import.meta.env.VITE_HERE_API_KEY}`;
				} else {
					url = `https://autosuggest.search.hereapi.com/v1/autosuggest?at=${location}&q=${searchTerm}&limit=3&type=place&lang=en&apikey=${import.meta.env.VITE_HERE_API_KEY}`;
				}
				const res = await fetch(url);

				if (!res.ok) {
					return suggestions;
				}
				const returnedData = await res.json();
				const newSuggestions = returnedData.items
					.filter((item) => item.address && item.address.label && item.id)
					.map((item) => {
						item.address.label = item.address.label.split(', ').slice(1).join(', ');
						return {store_name:`${item.title} - ${item.address.label}`, store_id:item.id};
					});

				suggestions = [...suggestions, ...newSuggestions];
			}
			return suggestions;
		} catch (error) {
			console.error('Error fetching autocomplete suggestions:', error);
			throw error;
		}
	}
}
export { getAutocompleteSuggestions };

// Retrieving user reviews, filtering and searching
async function getUserReviews({
	userId,
	limit,
	offset,
	sortBy,
	sortOrder,
	searchTerm,
	filterBy,
	filterValue
}) {
	try {
		let whereClause = { user_id: userId };
		let orderByClause = {};
		let filterClause = {};
		let searchClause = {};
		if (sortBy) {
			switch (sortBy) {
				case 'price':
					orderByClause = { price: sortOrder };
					break;
				case 'product_name':
					orderByClause = { products: { name: sortOrder } };
					break;
				case 'store_name':
					orderByClause = { stores: { name: sortOrder } };
					break;
				case 'rating':
					orderByClause = { rating: sortOrder };
					break;
				case 'review_text':
					orderByClause = { review_text: sortOrder };
					break;
				case 'review_date':
					orderByClause = { review_date: sortOrder };
					break;
				default:
					console.error('Invalid sort by value');
					throw new Error('Invalid sort by value');
			}
		}

		if (filterBy && filterValue) {
			console.log('Filtering reviews by:', filterBy, filterValue);
			switch (filterBy) {
				case 'product_name':
					whereClause = {
						...whereClause,
						products: { name: { contains: filterValue, mode: 'insensitive' } }
					};
					break;
				case 'store_name':
					whereClause = {
						...whereClause,
						stores: { name: { contains: filterValue, mode: 'insensitive' } }
					};
					break;
				case 'rating':
					whereClause = { ...whereClause, rating: { equals: parseInt(filterValue) || 0 } };
					break;
				case 'review_text':
					whereClause = {
						...whereClause,
						review_text: { contains: filterValue || '', mode: 'insensitive' }
					};
					break;
				case 'review_date':
					let parsedDate = new Date(filterValue);
					if (parsedDate.toString() === 'Invalid Date') {
						parsedDate = new Date();
					}
					whereClause = { ...whereClause, review_date: { gte: parsedDate } };
					break;
				case 'price':
					whereClause = { ...whereClause, price: { equals: parseFloat(filterValue) || 0 } };
					break;
				default:
					throw new Error('Invalid filter by value');
			}
		}

		if (searchTerm) {
			let parsedDate = new Date(searchTerm);
			if (parsedDate.toString() === 'Invalid Date') {
				parsedDate = new Date();
			}
			searchClause = {
				OR: [
					{ products: { name: { contains: searchTerm, mode: 'insensitive' } } },
					{ stores: { name: { contains: searchTerm, mode: 'insensitive' } } },
					{ review_text: { contains: searchTerm, mode: 'insensitive' } },
					{ review_date: { gte: parsedDate } },
					{ rating: parseInt(searchTerm) || 0 },
					{ price: parseFloat(searchTerm) || 0 }
				]
			};
		}

		const reviewsResult = await prisma.reviews.findMany({
			where: { AND: [whereClause, filterClause, searchClause] },
			include: {
				products: true,
				stores: true
			},
			orderBy: orderByClause,
			take: limit,
			skip: offset
		});
		const totalResult = await prisma.reviews.count({ 
			where: { AND: [whereClause, filterClause, searchClause] }
		});

		if (!reviewsResult || !totalResult) {
			return { reviews: [], total: 1 };
		}

		return {
			reviews: reviewsResult.map((review) => ({
				...review,
				product_name: review.products.name,
				store_name: review.stores.name
			})),
			total: totalResult
		};
	} catch (error) {
		console.error('Error retrieving user reviews:', error.message);
		throw error;
	}
}
export { getUserReviews };

// Liking/disliking a product
async function likeOrDislikeProduct(userId, cardId) {
	cardId = parseInt(cardId);
	let resultMessage = '';
	try {
		const existingFavorite = await prisma.favorites.findFirst({
			where: {
				user_id: userId,
				card_id: cardId
			}
		});

		if (existingFavorite) {
			await prisma.favorites.delete({
				where: {
					id: existingFavorite.id
				}
			});
			resultMessage = 'Product removed from favorites';
		} else {
			await prisma.favorites.create({
				data: {
					user_id: userId,
					card_id: cardId
				}
			});
			resultMessage = 'Product added to favorites';
		}
	} catch (error) {
		console.error('Error liking/unliking product:', error);
		throw error;
	}

	return resultMessage;
}
export { likeOrDislikeProduct };

// Rating a review and updating user's score
async function likeOrDislikeReview(userId, reviewId, liked) {
	let resultMessage = '';
	liked = liked === 'true' ? true : false;
	try {
		const review = await prisma.reviews.findUnique({
			where: {
				id: parseInt(reviewId)
			},
			select: { user_id: true, helpful_votes: true, total_votes: true }
		});

		if (!review) {
			console.log(`Review with ID ${reviewId} does not exist.`);
			throw new Error(`Review with ID ${reviewId} does not exist.`);
		}

		if (review.user_id === userId) {
			console.log(`User with ID ${userId} cannot vote on their own review.`);
			throw new Error(`User with ID ${userId} cannot vote on their own review.`);
		}
		resultMessage = 'Transaction failed';
		const existingUserVotes = await prisma.users.findUnique({
			where: {
				id: userId
			},
			select: { liked_reviews_ids: true, disliked_reviews_ids: true }
		});

		const likedReviewsIds = existingUserVotes.liked_reviews_ids || [];
		const dislikedReviewsIds = existingUserVotes.disliked_reviews_ids || [];

		await prisma.$transaction(async (prisma) => {
			switch (liked) {
				case true:
					if (likedReviewsIds.includes(parseInt(reviewId))) {
						await prisma.users.update({
							where: {
								id: userId
							},
							data: {
								liked_reviews_ids: {
									set: likedReviewsIds.filter((id) => id !== parseInt(reviewId))
								}
							}
						});

						await prisma.reviews.update({
							where: {
								id: parseInt(reviewId)
							},
							data: {
								helpful_votes: {
									increment: -1
								},
								total_votes: {
									increment: -1
								}
							}
						});

						resultMessage = 'Rating removed';

						const userReviews = await prisma.reviews.findMany({
							where: {
								user_id: review.user_id
							}
						});

						const totalHelpfulVotes = userReviews.reduce(
							(sum, review) => sum + review.helpful_votes,
							0
						);
						const totalVotes = userReviews.reduce((sum, review) => sum + review.total_votes, 0);
						const helpfulRatio = totalVotes > 0 ? totalHelpfulVotes / totalVotes : 0;

						await prisma.users.update({
							where: {
								id: review.user_id
							},
							data: {
								helpful_ratio: helpfulRatio
							}
						});

						return resultMessage;
					} else if (dislikedReviewsIds.includes(parseInt(reviewId))) {
						await prisma.users.update({
							where: {
								id: userId
							},
							data: {
								disliked_reviews_ids: {
									set: dislikedReviewsIds.filter((id) => id !== parseInt(reviewId))
								},
								liked_reviews_ids: {
									push: parseInt(reviewId)
								}
							}
						});

						await prisma.reviews.update({
							where: {
								id: parseInt(reviewId)
							},
							data: {
								helpful_votes: {
									increment: 1
								}
							}
						});

						resultMessage = 'Review rated as helpful';
					} else {
						await prisma.users.update({
							where: {
								id: userId
							},
							data: {
								liked_reviews_ids: {
									set: likedReviewsIds.concat(parseInt(reviewId))
								}
							}
						});

						await prisma.reviews.update({
							where: {
								id: parseInt(reviewId)
							},
							data: {
								helpful_votes: {
									increment: 1
								},
								total_votes: {
									increment: 1
								}
							}
						});

						resultMessage = 'Review rated as helpful';
					}
					break;
				case false:
					if (dislikedReviewsIds.includes(parseInt(reviewId))) {
						await prisma.users.update({
							where: {
								id: userId
							},
							data: {
								disliked_reviews_ids: {
									set: dislikedReviewsIds.filter((id) => id !== parseInt(reviewId))
								}
							}
						});

						await prisma.reviews.update({
							where: {
								id: parseInt(reviewId)
							},
							data: {
								total_votes: {
									increment: -1
								}
							}
						});
						resultMessage = 'Rating removed';

						const userReviews = await prisma.reviews.findMany({
							where: {
								user_id: review.user_id
							}
						});

						const totalHelpfulVotes = userReviews.reduce(
							(sum, review) => sum + review.helpful_votes,
							0
						);
						const totalVotes = userReviews.reduce((sum, review) => sum + review.total_votes, 0);
						const helpfulRatio = totalVotes > 0 ? totalHelpfulVotes / totalVotes : 0;

						await prisma.users.update({
							where: {
								id: review.user_id
							},
							data: {
								helpful_ratio: helpfulRatio
							}
						});
						return resultMessage;
					} else if (likedReviewsIds.includes(parseInt(reviewId))) {
						await prisma.users.update({
							where: {
								id: userId
							},
							data: {
								liked_reviews_ids: {
									set: likedReviewsIds.filter((id) => id !== parseInt(reviewId))
								},
								disliked_reviews_ids: {
									push: parseInt(reviewId)
								}
							}
						});

						await prisma.reviews.update({
							where: {
								id: parseInt(reviewId)
							},
							data: {
								helpful_votes: {
									increment: -1
								}
							}
						});

						resultMessage = 'Review rated as not helpful';
					} else {
						await prisma.users.update({
							where: {
								id: userId
							},
							data: {
								disliked_reviews_ids: {
									set: dislikedReviewsIds.concat(parseInt(reviewId))
								}
							}
						});

						await prisma.reviews.update({
							where: {
								id: parseInt(reviewId)
							},
							data: {
								total_votes: {
									increment: 1
								}
							}
						});
						resultMessage = 'Review rated as not helpful';
					}
					break;
			}

			const userReviews = await prisma.reviews.findMany({
				where: {
					user_id: review.user_id
				}
			});

			const totalHelpfulVotes = userReviews.reduce((sum, review) => sum + review.helpful_votes, 0);
			const totalVotes = userReviews.reduce((sum, review) => sum + review.total_votes, 0);
			const helpfulRatio = totalVotes > 0 ? totalHelpfulVotes / totalVotes : 0;
			console.log('totalHelpfulVotes: ' + totalHelpfulVotes);
			console.log('totalVotes: ' + totalVotes);
			console.log('helpfulRatio: ' + helpfulRatio);
			await prisma.users.update({
				where: {
					id: review.user_id
				},
				data: {
					helpful_ratio: helpfulRatio
				}
			});
		});
		return resultMessage;
	} catch (error) {
		console.error('Error liking or disliking review:', error);
		throw error;
	}
}
export { likeOrDislikeReview };

// Get card by id
async function getCardById(cardId, userId = 'guest') {
	try {
		const card = await prisma.cards.findUnique({
			where: {
				id: parseInt(cardId)
			}
		});

		if (userId !== 'guest') {
			const isFavorite = await prisma.favorites.findFirst({
				where: {
					user_id: userId,
					card_id: parseInt(cardId)
				}
			});
			
			const firstReviewId = card.review_ids[0];
			const storeIdFromReview = await prisma.reviews.findFirst({
				where: {
					id: firstReviewId
				},
				select: {
					store_id: true
				}
			});
			const storeMapsId = await prisma.stores.findUnique({
				where: {
					id: storeIdFromReview.store_id
				},
				select: {
					name: true,
					address: true,
					maps_id: true
				}
			});

			card.store_name = storeMapsId.name + ' - ' + storeMapsId.address || null;
			card.store_maps_id = storeMapsId.maps_id || null;

			card.is_favourite = !!isFavorite; // Set is_favourite based on whether the card is favorited by the user
		} else {
			card.is_favourite = false;
		}

		const images = await prisma.images.findMany({
			where: {
				review_id: {
					in: card.review_ids
				}
			},
			select: {
				image_path: true
			}
		});
		card.images = images;

		return card;
	} catch (error) {
		console.error('Error retrieving card:', error);
		throw error;
	}
}
export { getCardById };

// Get card is_favourite status
async function getCardIsFavourite(cardId, userId) {
	try {
		const isFavourite = await prisma.favorites.findFirst({
			where: {
				user_id: parseInt(userId),
				card_id: cardId
			}
		});
		return !!isFavourite;
	} catch (error) {
		console.error('Error retrieving card is_favourite status:', error);
		throw error;
	}
}
export { getCardIsFavourite };

// Get reviews by list of ids
async function getReviewsByIds(reviewIds) {
	try {
		const reviews = await prisma.reviews.findMany({
			where: {
				id: {
					in: reviewIds
				}
			}
		});
		return reviews;
	} catch (error) {
		console.error('Error retrieving reviews:', error);
		throw error;
	}
}
export { getReviewsByIds };

// Get reviews by card id with pagination
async function getReviewsByCardId(cardId, limit, offset, userId = 'guest') {
	try {
		// Retrieve the review ids associated with the card
		const card = await prisma.cards.findUnique({
			where: {
				id: cardId
			},
			select: {
				review_ids: true
			}
		});
		const reviewIds = card.review_ids;

		// Fetch the reviews based on the retrieved review ids
		const reviews = await prisma.reviews.findMany({
			where: {
				id: {
					in: reviewIds
				}
			},
			take: limit,
			skip: offset
		});

		if (userId !== 'guest') {
			// Retrieve the liked and disliked review ids of the user
			const user = await prisma.users.findUnique({
				where: {
					id: userId
				},
				select: {
					liked_reviews_ids: true,
					disliked_reviews_ids: true
				}
			});

			// Update each review with liked and disliked status
			reviews.forEach((review) => {
				review.liked = user.liked_reviews_ids.includes(review.id);
				review.disliked = user.disliked_reviews_ids.includes(review.id);
			});
		}

		// Get the total count of reviews associated with the card
		const totalReviews = await prisma.reviews.count({
			where: {
				id: {
					in: reviewIds
				}
			}
		});

		return {
			paginatedReviews: reviews,
			total: totalReviews
		};
	} catch (error) {
		console.error('Error retrieving reviews:', error);
		throw error;
	}
}
export { getReviewsByCardId };

// Get images paths by review id
async function getImagesByReviewId(reviewId) {
	try {
		// Retrieve images associated with the given review id
		const images = await prisma.images.findMany({
			where: {
				review_id: reviewId
			},
			select: {
				image_path: true
			}
		});

		// Extract and return image paths from the retrieved images
		return images.map((image) => image.image_path);
	} catch (error) {
		console.error('Error retrieving images:', error);
		throw error;
	}
}
export { getImagesByReviewId };

// Get user display info ie display_name number_of_reviews helpful_review_score
async function getUserDisplayInfo(userId) {
	try {
		const userInfo = await prisma.users.findUnique({
			where: {
				id: userId
			},
			select: {
				display_name: true,
				number_of_reviews: true,
				helpful_ratio: true
			}
		});

		return userInfo;
	} catch (error) {
		console.error('Error retrieving user display info:', error);
		throw error;
	}
}
export { getUserDisplayInfo };

// Retrive all stores
async function getStores(offset, limit) {
	try {
		const stores = await prisma.stores.findMany({
			take: limit,
			skip: offset
		});

		const total = await prisma.stores.count();

		return {
			stores: stores,
			total: total
		};
	} catch (error) {
		console.error('Error retrieving stores:', error);
		throw error;
	}
}
export { getStores };

// Change user fullname
async function changeUserFullname(userId, fullname) {
	try {
		await prisma.users.update({
			where: {
				id: userId
			},
			data: {
				display_name: fullname
			}
		});
	} catch (error) {
		console.error('Error changing user fullname:', error);
		throw error;
	}
}
export { changeUserFullname };

// Change user email
async function changeUserEmail(userId, email) {
	try {
		await prisma.users.update({
			where: {
				id: userId
			},
			data: {
				email: email
			}
		});
	} catch (error) {
		console.error('Error changing user email:', error);
		throw error;
	}
}
export { changeUserEmail };

// Change user password, first check if current password is correct and then compare new password and confirm password
async function changeUserPassword(userId, currentPassword, newPassword) {
	try {
		const user = await prisma.users.findUnique({
			where: {
				id: userId
			}
		});

		if (!user) {
			return {
				success: false,
				message: 'User not found'
			};
		}

		const passwordMatch = await bcrypt.compare(currentPassword, user.password);

		if (!passwordMatch) {
			return {
				success: false,
				message: 'Current password is incorrect!'
			};
		}

		if (await bcrypt.compare(newPassword, user.password)) {
			return {
				success: false,
				message: 'New password cannot be the same as the current password!'
			};
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await prisma.users.update({
			where: {
				id: userId
			},
			data: {
				password: hashedPassword
			}
		});

		return {
			success: true,
			message: 'Password changed successfully!'
		};
	} catch (error) {
		console.error('Error changing user password:', error);
		return {
			success: false,
			message: 'Error changing password!'
		};
	}
}
export { changeUserPassword };
