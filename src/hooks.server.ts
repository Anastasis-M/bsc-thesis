import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { checkToken, connectToDB, disconnectFromDB, getUserRole } from '$lib/db';

await connectToDB();
export const handle: Handle = async ({ event, resolve }) => {
	let token = event.cookies.get('token');
	let url = event.url.pathname;
	const unProtectedRoutesPattern = new RegExp('^/$|^/logout/?|^/products/\\d+/?|^/api/.*$');
	if (token === undefined && !unProtectedRoutesPattern.test(url)) {
    	console.log("token undefined");
		console.log(url);
		event.cookies.delete('token', {
			path: '/'
		});
		event.locals.role = 'guest';
		event.locals.userInfo = null;
		await disconnectFromDB();
		throw redirect(302, "/");
	} else if (token !== undefined) {
		const result = await checkToken(token);
		if (result === false && !unProtectedRoutesPattern.test(url)) {
			console.log('token invalid');
			await disconnectFromDB();
			throw redirect(302, '/');
		} else if (result !== false) {
			const user_id = result;
			event.locals.user_id = user_id;
			const role = await getUserRole(user_id);
			event.locals.role = role;
			await disconnectFromDB();
			return await resolve(event);
		}
	}
	event.locals.role = 'guest';
	await disconnectFromDB();
	return await resolve(event);
};

