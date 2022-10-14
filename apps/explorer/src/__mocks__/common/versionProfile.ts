// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile} from '_gqlTypes/GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY';
import {mockTree} from './tree';

export const mockVersionProfile: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile = {
    id: 'my_profile',
    trees: [mockTree]
};
