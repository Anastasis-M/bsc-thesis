import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Unplugin Icons
import Icons from 'unplugin-icons/vite'

export default defineConfig({
	plugins: [sveltekit(), purgeCss(),Icons({
		compiler: 'svelte',
	  })],
	  server: {
		// Specify the directory to be served statically
		fs: {
		  strict: true,
		  // Assuming review_images is at the root level
		  allow: ['review_images']
		}
	  }
});