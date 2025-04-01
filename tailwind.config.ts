import { join } from 'path'
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin'

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}', join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')],
	theme: {
		extend: {
			borderRadius: {
				'4xl': '28px',
			  },
			  gridTemplateColumns: {
				5: 'repeat(5, 1fr)',
				4: 'repeat(4, 1fr)',
				3: 'repeat(3, 1fr)',
				2: 'repeat(2, 1fr)',
				1: 'repeat(1, 1fr)',
			  },	
		},
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: 'crimson',
						enhancements: true,
					},
				],
			},
		}),
		require('@tailwindcss/container-queries'),
	],
} satisfies Config;
