// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import React from 'react';
import {setPath} from 'Reducer/NavigationReducerActions';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';
import themingVar from '../../themingVar';
import HeaderColumnNavigationActions from '../HeaderColumnNavigationActions';

interface IHeaderColumnProps {
    isActive: boolean;
}

const HeaderColumn = styled.div<IHeaderColumnProps>`
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;
    background: ${themingVar['@item-active-bg']};

    ${({isActive}) =>
        !isActive &&
        `&:hover {
        background: ${themingVar['@item-hover-bg']};
    }`}
`;

interface IHeaderColumnNavigationProps {
    depth: number;
    setItems?: React.Dispatch<React.SetStateAction<IRecordAndChildren[]>>;
    isDetail?: boolean;
    isActive?: boolean;
}

function HeaderColumnNavigation({depth, setItems, isDetail, isActive}: IHeaderColumnNavigationProps): JSX.Element {
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

    const headerClickFn = () => {
        if (!isActive) {
            if (parent) {
                goToPath();
            } else {
                resetPath();
            }
        }
    };
    const display = parent ? parent.label || parent.id : activeTree?.label || activeTree?.id;

    return (
        <HeaderColumn onClick={headerClickFn} isActive={isActive}>
            <span>{display}</span>
            {isActive && <HeaderColumnNavigationActions depth={depth} setItems={setItems} isDetail={isDetail} />}
        </HeaderColumn>
    );
}

export default HeaderColumnNavigation;
