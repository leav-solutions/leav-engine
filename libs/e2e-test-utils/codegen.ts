import {type CodegenConfig} from '@graphql-codegen/cli';

const apiUrl = 'http://localhost:4001';

const config: CodegenConfig = {
    schema: `${apiUrl}/graphql?key=e2e-playwright-test-api-key`,
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
