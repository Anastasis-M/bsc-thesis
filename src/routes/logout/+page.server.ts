import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { logout } from '$lib/db';

export const load = (async ({ cookies }) => {
	const token = cookies.get('token');
	cookies.set('token', '', {
		path: '/',
		maxAge: 0
	});
	
	try {
		await logout(token);
		redirect(302, '/');
	} catch (error) {
		redirect(302, '/');
	}
}) satisfies PageServerLoad;
