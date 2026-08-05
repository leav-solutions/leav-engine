import {type CodegenConfig} from '@graphql-codegen/cli';
import apiKey from './apolloApiKey';

const apiUrl = 'http://core.leav.localhost';

const config: CodegenConfig = {
    schema: [
        {
            [`${apiUrl}/graphql?key=${apiKey}`]: {},
        },
    ],
    documents: [
        'src/(_queries|gqlFragments)/**/*.ts',
        'src/components/**/_queries/**/*.ts',
        'src/modules/**/_queries/**/*.ts',
        'src/**/*.graphql',
    ],
    generates: {
        'src/_gqlTypes/index.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
                {
                    add: {
                        content: "import {IPreviewScalar} from '@leav/utils'",
                    },
                },
            ],
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
                scalars: {
                    Preview: 'IPreviewScalar',
                },
            },
        },
    },
};

export default config;
