// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveTree} from 'graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {mockActiveTree} from '__mocks__/common/activeTree';

export const useActiveTree = (): [IActiveTree | undefined, (newActiveTree: IActiveTree) => void] => {
    const updateActiveTree = jest.fn();

    return [{...mockActiveTree}, updateActiveTree];
};
