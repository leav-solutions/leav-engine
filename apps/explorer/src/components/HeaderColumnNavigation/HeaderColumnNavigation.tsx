// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import React from 'react';
import {resetNavigationRecordDetail, setNavigationPath} from 'redux/navigation';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
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
    const navigation = useAppSelector(state => state.navigation);
    const dispatch = useAppDispatch();
    const currentPositionInPath = depth;

    const [activeTree] = useActiveTree();

    const parent = navigation.path[currentPositionInPath - 1];

    const resetPath = () => {
        dispatch(setNavigationPath([]));
        dispatch(resetNavigationRecordDetail());
    };

    const goToPath = () => {
        dispatch(setNavigationPath(navigation.path.slice(0, currentPositionInPath)));
        dispatch(resetNavigationRecordDetail());
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
