import {type GetVersionableAttributesByLibraryQuery} from '_ui/_gqlTypes';
import {mockTreeSimple} from './tree';

export const mockVersionProfile: GetVersionableAttributesByLibraryQuery['attributes']['list'][0]['versions_conf']['profile'] =
    {
        id: 'my_profile',
        trees: [mockTreeSimple],
    };
