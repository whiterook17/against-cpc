import vercelAdapter from '@sveltejs/adapter-vercel';
import nodeAdapter   from '@sveltejs/adapter-node';

// Use adapter-vercel on Vercel CI; adapter-node locally (avoids Windows symlink EPERM).
const adapter = process.env.VERCEL ? vercelAdapter() : nodeAdapter();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter,
		prerender: {
			// Warn (don't throw) on 404s during prerender: download files, og-image,
			// and simulator/lab routes don't exist yet — they're Phase 5/8 deliverables.
			handleHttpError: ({ path, message }) => {
				const known = [
					'/og-image.png',
					'/downloads/against-cpc-full.pdf',
					'/downloads/against-cpc-full.docx',
				];
				if (known.includes(path) || path.startsWith('/construct/simulator') || path.startsWith('/construct/parameter-lab')) {
					console.warn(`[prerender] ignoring expected 404: ${path}`);
					return;
				}
				throw new Error(message);
			},
		},
	}
};

export default config;
