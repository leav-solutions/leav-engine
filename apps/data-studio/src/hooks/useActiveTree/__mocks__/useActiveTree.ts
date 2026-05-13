import {type IActiveTree} from '../../../graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {mockActiveTree} from '../../../__mocks__/common/activeTree';

export const useActiveTree = (): [IActiveTree | undefined, (newActiveTree: IActiveTree) => void] => {
    const updateActiveTree = jest.fn();

    return [{...mockActiveTree}, updateActiveTree];
};
