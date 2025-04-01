import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate, fail } from 'sveltekit-superforms';
import { checkToken, changeUserPassword, changeUserFullname, changeUserEmail } from '$lib/db';

const accountSettingsNameSchema = z.object({
	fullname: z.string().min(3).max(50)
});

const accountSettingsEmailSchema = z.object({
	email: z.string().email().min(3).max(50)
});

const accountSettingsPasswordSchema = z.object({
	currentPassword: z.string().min(8).max(50),
	newPassword: z.string().min(8).max(50),
	confirmPassword: z.string().min(8).max(50)
});

export const load = (async ({ cookies }) => {
	const accountSettingsNameForm = await superValidate(zod(accountSettingsNameSchema));
	const accountSettingsEmailForm = await superValidate(zod(accountSettingsEmailSchema));
	const accountSettingsPasswordForm = await superValidate(zod(accountSettingsPasswordSchema));
	const token = cookies.get('token');
	if (!token) {
		return {
			accountSettingsNameForm: accountSettingsNameForm,
			accountSettingsEmailForm: accountSettingsEmailForm,
			accountSettingsPasswordForm: accountSettingsPasswordForm,
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
				accountSettingsNameForm: accountSettingsNameForm,
				accountSettingsEmailForm: accountSettingsEmailForm,
				accountSettingsPasswordForm: accountSettingsPasswordForm,
				toast: {
					message: 'You are not logged in!',
					background: 'variant-filled-warning'
				},
				status: 401
			};
		}
	}
	return { accountSettingsNameForm, accountSettingsEmailForm, accountSettingsPasswordForm };
}) satisfies PageServerLoad;

/** @type {import('./$types').Actions} */
export const actions = {
	changeName: async ({ request, cookies }) => {
		const accountSettingsNameForm = await superValidate(request, zod(accountSettingsNameSchema));

		if (!accountSettingsNameForm.valid) {
			return fail(400, {
				accountSettingsNameForm
			});
		}

		let userId;
		const token = cookies.get('token');

		if (!token) {
			return message(accountSettingsNameForm, 'You are not logged in!', {
				status: 401
			});
		} else {
			userId = await checkToken(token);
			if (!userId) {
				return message(accountSettingsNameForm, 'You are not logged in!', {
					status: 401
				});
			}
		}

		try {
			await changeUserFullname(userId, accountSettingsNameForm.data.fullname);
		} catch (error) {
			return message(accountSettingsNameForm, 'Error changing name', {
				status: 500
			});
		}

		return message(
			accountSettingsNameForm,
			'Name changed successfully to ' + accountSettingsNameForm.data.fullname
		);
	},
	changeEmail: async ({ request, cookies }) => {
		const accountSettingsEmailForm = await superValidate(request, zod(accountSettingsEmailSchema));

		if (!accountSettingsEmailForm.valid) {
			return fail(400, {
				accountSettingsEmailForm
			});
		}

		let userId;
		const token = cookies.get('token');

		if (!token) {
			return message(accountSettingsEmailForm, 'You are not logged in!', {
				status: 401
			});
		} else {
			userId = await checkToken(token);
			if (!userId) {
				return message(accountSettingsEmailForm, 'You are not logged in!', {
					status: 401
				});
			}
		}

		try {
			await changeUserEmail(userId, accountSettingsEmailForm.data.email);
		} catch (error) {
			return message(accountSettingsEmailForm, 'Error changing email', {
				status: 500
			});
		}

		return message(
			accountSettingsEmailForm,
			'Email changed successfully to ' + accountSettingsEmailForm.data.email
		);
	},
	changePassword: async ({ request, cookies }) => {
		const accountSettingsPasswordForm = await superValidate(
			request,
			zod(accountSettingsPasswordSchema)
		);

		if (!accountSettingsPasswordForm.valid) {
			return fail(400, {
				accountSettingsPasswordForm
			});
		}

		let userId;
		const token = cookies.get('token');

		if (!token) {
			return message(accountSettingsPasswordForm, 'You are not logged in!', {
				status: 401
			});
		} else {
			userId = await checkToken(token);
			if (!userId) {
				return message(accountSettingsPasswordForm, 'You are not logged in!', {
					status: 401
				});
			}
		}

		const currentPassword = accountSettingsPasswordForm.data.currentPassword;
		const newPassword = accountSettingsPasswordForm.data.newPassword;
		const confirmPassword = accountSettingsPasswordForm.data.confirmPassword;
		if (newPassword !== confirmPassword) {
			return message(
				accountSettingsPasswordForm,
				'New password and confirm password do not match!',
				{
					status: 400
				}
			);
		}

		try {
			const response = await changeUserPassword(userId, currentPassword, newPassword);
			if (!response.success) {
				return message(accountSettingsPasswordForm, response.message, {
					status: 400
				});
			}
			return message(accountSettingsPasswordForm, response.message);
		} catch (error) {
			return message(accountSettingsPasswordForm, 'Error changing password!', {
				status: 500
			});
		}
	}
};
