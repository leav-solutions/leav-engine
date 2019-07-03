import {GET_TREES_trees} from '../_gqlTypes/GET_TREES';

export const mockTree: GET_TREES_trees = {
    id: 'test_tree',
    system: false,
    libraries: ['test_lib'],
    label: {
        fr: 'TestTree',
        en: 'TestTree'
    }
};
