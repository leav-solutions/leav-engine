// Builds the core GraphQL endpoint URL with the apiKey as the `key` query param.
// coreUrl may include a base path (e.g. http://host/core), so we append /graphql to the
// existing pathname instead of using '/graphql' which would replace it.
// URL constructor handles encoding — safer than string concatenation.
export const buildCoreGraphqlUrl = (coreUrl: string, apiKey: string): string => {
    const url = new URL(coreUrl);
    url.pathname = `${url.pathname.replace(/\/$/, '')}/graphql`;
    url.searchParams.set('key', apiKey);
    return url.toString();
};
