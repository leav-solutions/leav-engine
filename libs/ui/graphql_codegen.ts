// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type {CodegenConfig} from '@graphql-codegen/cli';
import apolloApiKey from './apollo.apiKey';

const config: CodegenConfig = {
    overwrite: true,
    schema: `http://core.leav.localhost/graphql?key=${apolloApiKey}`,
    documents: 'src/_queries/**/*.ts',
    generates: {
        'src/_queries/_types/': {plugins: ['typescript']}
    },
    config: {
        namingConvention: 'change-case-all#uppercase'
    }
};

export default config;
