// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordAndChildren} from 'queries/trees/getTreeContentQuery';
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';
import {setPath} from '../../Reducer/NavigationReducerActions';
import themingVar from '../../themingVar';
import ActiveHeaderCellNavigation from '../ActiveHeaderCellNavigation';

const HeaderCell = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;
    background: ${themingVar['@item-active-bg']};

    &:hover {
        background: ${themingVar['@item-hover-bg']};
    }
`;

interface IHeaderCellNavigationProps {
    depth: number;
    setItems?: React.Dispatch<React.SetStateAction<IRecordAndChildren[]>>;
    isDetail?: boolean;
    isActive?: boolean;
}

function HeaderCellNavigation({depth, setItems, isDetail, isActive}: IHeaderCellNavigationProps): JSX.Element {
    const currentPositionInPath = depth;

    const {stateNavigation, dispatchNavigation} = useStateNavigation();
    const [activeTree] = useActiveTree();

    const parent = stateNavigation.path[currentPositionInPath - 1];

    const resetPath = () => {
        dispatchNavigation(setPath([]));
    };

    const goToPath = () => {
        dispatchNavigation(setPath(stateNavigation.path.slice(0, currentPositionInPath)));
    };

    const headerClickFn = parent ? goToPath : resetPath;
    const display = parent ? parent.label || parent.id : activeTree?.label || activeTree?.id;

    return (
        <HeaderCell onClick={headerClickFn}>
            <span>{display}</span>
            {isActive && <ActiveHeaderCellNavigation depth={depth} setItems={setItems} isDetail={isDetail} />}
        </HeaderCell>
    );
}

export default HeaderCellNavigation;
