// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CodegenConfig} from '@graphql-codegen/cli';
// @ts-ignore this file might not be present in local
import apiKey from './apollo.apiKey';

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
                    transformUnderscore: true
                }
            }
        }
    }
};

export default config;
