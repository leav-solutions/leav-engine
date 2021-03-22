// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import React from 'react';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import DefaultActions from './DefaultActions';
import DetailActions from './DetailActions';
import SelectionActions from './SelectionActions';

interface IActiveHeaderCellNavigationProps {
    depth: number;
    setItems?: React.Dispatch<React.SetStateAction<IRecordAndChildren[]>>;
    isDetail?: boolean;
}

function HeaderColumnNavigationActions({depth, setItems, isDetail}: IActiveHeaderCellNavigationProps): JSX.Element {
    const currentPositionInPath = depth;

    const {stateNavigation} = useStateNavigation();

    const parent = stateNavigation.path[currentPositionInPath - 1];

    return (
        <span>
            <SelectionActions parent={parent} depth={depth} />
            <DefaultActions setItems={setItems} isDetail={isDetail} />
            <DetailActions depth={depth} isDetail={isDetail} />
        </span>
    );
}

export default HeaderColumnNavigationActions;
