import {type CodegenConfig} from '@graphql-codegen/cli';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- gitignored file, absent in CI but present locally
// @ts-ignore this file might not be present in local
import apiKey from './apolloApiKey';

const apiUrl = process.env.CORE_URL || 'http://core.leav.localhost';

const config: CodegenConfig = {
    schema: `${apiUrl}/graphql?key=${apiKey}`,
    documents: ['src/**/*.graphql'],
    generates: {
        'src/_gqlTypes/index.ts': {
            plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
            config: {
                namingConvention: {
                    typeNames: 'change-case-all#pascalCase',
                    enumValues: 'keep',
                    transformUnderscore: true,
                },
                onlyOperationTypes: true,
                skipTypename: true,
                flattenGeneratedTypes: true,
                flattenGeneratedTypesIncludeFragments: true,
                exportFragmentSpreadSubTypes: true,
                mergeFragmentTypes: true,
            },
        },
    },
};

export default config;
