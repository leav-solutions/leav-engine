// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CodegenConfig} from '@graphql-codegen/cli';
import token from './apollo.token';

const apiUrl = 'http://core.leav.localhost';

const config: CodegenConfig = {
    schema: [
        {
            [`${apiUrl}/graphql`]: {
                headers: {
                    Authorization: token
                }
            }
        }
    ],
    documents: ['src/graphQL/subscribes/**/*.ts'],
    generates: {
        'src/_gqlTypes_subs/generated.ts': {
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo']
        }
    }
};

export default config;
