import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const validTerms = ['nuc', 'nbte', 'ncce', 'cbt', 'utme', 'waec', 'neco', 'jamb', 'hnd', 'nd', 'nce', 'gce', 'post_utme'];
	if (params.term && !validTerms.includes(params.term)) {
		throw redirect(307, '/glossary');
	}
};
