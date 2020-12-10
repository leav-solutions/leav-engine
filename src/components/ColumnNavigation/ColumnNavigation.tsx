// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import themingVar from '../../themingVar';
import CellNavigation from '../CellNavigation';
import HeaderCellNavigation from '../HeaderCellNavigation';
import ColumnFromPath from './ColumnFromPath';

const Column = styled.div`
    border-right: 1px solid ${themingVar['@divider-color']};
    min-width: 20rem;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;

    background: ${themingVar['@default-bg']};
`;

const ColumnContent = styled.div`
    overflow-y: scroll;
    height: 100%;
`;

interface IColumnNavigationProps {
    treeElements: IRecordAndChildren[];
}

function ColumnNavigation({treeElements}: IColumnNavigationProps): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    return (
        <>
            <Column>
                <HeaderCellNavigation depth={1} />
                <ColumnContent>
                    {treeElements.map(treeElement => (
                        <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={1} />
                    ))}
                </ColumnContent>
            </Column>

            {stateNavigation.path.map(
                (pathPart, index) =>
                    treeElements.length && (
                        <ColumnFromPath
                            key={pathPart.id}
                            pathPart={pathPart}
                            treeElements={treeElements}
                            depth={index + 2}
                            showLoading={stateNavigation.isLoading && index === stateNavigation.path.length - 1}
                        />
                    )
            )}
        </>
    );
}

export default ColumnNavigation;
