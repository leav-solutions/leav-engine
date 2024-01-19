// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GetVersionableAttributesByLibraryQuery} from '_ui/_gqlTypes';
import {mockTreeSimple} from './tree';

export const mockVersionProfile: GetVersionableAttributesByLibraryQuery['attributes']['list'][0]['versions_conf']['profile'] = {
    id: 'my_profile',
    trees: [mockTreeSimple]
};
