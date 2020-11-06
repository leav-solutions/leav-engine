import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {useActiveTree} from '../../hook/ActiveTreeHook';
import {setPath} from '../../Reducer/NavigationReducer';
import themingVar from '../../themingVar';

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
}

function HeaderCellNavigation({depth}: IHeaderCellNavigationProps): JSX.Element {
    const currentPositionInPath = depth - 2;

    const {stateNavigation, dispatchNavigation} = useStateNavigation();

    const [activeTree] = useActiveTree();

    const currentPath = stateNavigation.path[currentPositionInPath];

    const resetPath = () => {
        dispatchNavigation(setPath([]));
    };

    if (!currentPath) {
        return <HeaderCell onClick={resetPath}>{activeTree?.label || activeTree?.id}</HeaderCell>;
    }

    const goToPath = () => {
        dispatchNavigation(setPath(stateNavigation.path.slice(0, currentPositionInPath + 1)));
    };

    return <HeaderCell onClick={goToPath}>{currentPath.label || currentPath.id}</HeaderCell>;
}

export default HeaderCellNavigation;
