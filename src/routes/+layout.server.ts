import type { LayoutServerLoad } from './$types';
import { getUserInfoByUserId } from '$lib/db';

export const load: LayoutServerLoad = async ({ locals}) => {
	if (locals.user_id !== undefined && locals.user_id !== 'guest') {
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
				return { user: locals.userInfo };
			}
		}
	}
	return { user: locals.userInfo };
};


