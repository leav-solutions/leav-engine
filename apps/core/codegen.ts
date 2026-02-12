// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type CodegenConfig} from '@graphql-codegen/cli';

// @ts-ignore this file might not be present in local
import apiKey from './apolloApiKey';

const apiUrl = 'http://core.leav.localhost';

const config: CodegenConfig = {
    schema: `${apiUrl}/graphql?key=${apiKey}`,
    documents: ['src/__tests__/e2e/**/*.graphql'],
    generates: {
        'src/__tests__/e2e/_gqlTypes/index.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-graphql-request',
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
