// src/lib/schema/graph.ts

/**
 * Combines multiple Schema.org objects into a single JSON-LD @graph block,
 * removing redundant '@context' properties to satisfy W3C validation.
 */
export function buildPageGraph(schemas: any[]): string {
	const cleanedSchemas = schemas.map(schema => {
		// Clone and delete @context if it exists to prevent duplication inside the @graph node
		const clone = { ...schema };
		delete clone['@context'];
		return clone;
	});

	const graph = {
		'@context': 'https://schema.org',
		'@graph': cleanedSchemas
	};

	return JSON.stringify(graph);
}
