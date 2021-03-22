// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ActiveCellNavigation from 'components/ActiveCellNavigation';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../graphQL/queries/trees/getTreeContentQuery';
import themingVar from '../../themingVar';
import CellNavigation from '../CellNavigation';
import HeaderColumnNavigation from '../HeaderColumnNavigation';
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

    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(treeElements);
    }, [setItems, treeElements]);

    const currentColumnActive = !stateNavigation.recordDetail && stateNavigation.path.length === 0;

    return (
        <>
            <Column>
                <HeaderColumnNavigation depth={0} setItems={setItems} isActive={currentColumnActive} />
                <ColumnContent>
                    {items.map(treeElement =>
                        currentColumnActive ? (
                            <ActiveCellNavigation
                                key={treeElement.record.whoAmI.id}
                                treeElement={treeElement}
                                depth={0}
                            />
                        ) : (
                            <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={0} />
                        )
                    )}
                </ColumnContent>
            </Column>
            {stateNavigation.path.map(
                (pathPart, index) =>
                    treeElements.length && (
                        <ColumnFromPath
                            key={pathPart.id}
                            pathPart={pathPart}
                            treeElements={treeElements}
                            depth={index + 1}
                            showLoading={stateNavigation.isLoading && index === stateNavigation.path.length - 1}
                            columnActive={!stateNavigation.recordDetail && index === stateNavigation.path.length - 1}
                        />
                    )
            )}
        </>
    );
}

export default ColumnNavigation;
