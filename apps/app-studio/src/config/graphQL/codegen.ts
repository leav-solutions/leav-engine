import {type CodegenConfig} from '@graphql-codegen/cli';

// @ts-ignore this file might not be present in local
import apiKey from './apolloApiKey';

const apiUrl = 'http://core.leav.localhost';

const config: CodegenConfig = {
    schema: `${apiUrl}/graphql?key=${apiKey}`,
    documents: ['src/**/*.graphql'],
    generates: {
        './src/__generated__/index.ts': {
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
            config: {
                skipTypename: true,
                mergeFragmentTypes: true,
                namingConvention: {
                    typeNames: 'change-case-all#pascalCase',
                    enumValues: 'keep',
                    transformUnderscore: true,
                },
            },
        },
    },
};

export default config;
