import {GenericClient as BaseGenericClient} from '@leav/e2e-test-utils';
import {GraphQLClient} from 'graphql-request';
import {getSdk} from '../_gqlTypes';

export class GenericClient extends BaseGenericClient {
    protected sdk = getSdk(new GraphQLClient(this.url, {}));
}
