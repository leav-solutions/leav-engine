// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import React from 'react';
import {useAppSelector} from 'redux/store';
import DefaultActions from './DefaultActions';
import SelectionActions from './SelectionActions';

interface IActiveHeaderCellNavigationProps {
    depth: number;
    isDetail?: boolean;
}

function HeaderColumnNavigationActions({depth, isDetail}: IActiveHeaderCellNavigationProps): JSX.Element {
    const currentPositionInPath = depth;

    const navigation = useAppSelector(state => state.navigation);
    const [activeTree] = useActiveTree();

    const parent = navigation.path[currentPositionInPath - 1];

    return activeTree ? (
        <Button.Group style={{height: '30px'}}>
            <SelectionActions parent={parent} depth={depth} />
            <DefaultActions activeTree={activeTree} parent={parent} isDetail={isDetail} />
        </Button.Group>
    ) : (
        <></>
    );
}

export default HeaderColumnNavigationActions;
