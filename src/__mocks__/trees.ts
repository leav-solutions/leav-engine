import {GET_TREES_trees_list} from '../_gqlTypes/GET_TREES';
import {TreeBehavior} from '../_gqlTypes/globalTypes';

export const mockTree: GET_TREES_trees_list = {
    id: 'test_tree',
    system: false,
    libraries: [{id: 'test_lib', label: {fr: 'Test Lib'}}],
    behavior: TreeBehavior.standard,
    label: {
        fr: 'TestTree',
        en: 'TestTree'
    }
};
