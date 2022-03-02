// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import React, {createRef, useEffect} from 'react';
import {INavigationElement} from 'redux/stateType';
import styled from 'styled-components';
import {GET_TREE_CONTENT, GET_TREE_CONTENTVariables} from '_gqlTypes/GET_TREE_CONTENT';
import {treeContentQuery} from '../../../../graphQL/queries/trees/getTreeContentQuery';
import themingVar from '../../../../themingVar';
import DetailNavigation from './DetailNavigation';
import HeaderColumnNavigation from './HeaderColumnNavigation';
import Row from './Row';

const ColumnWrapper = styled.div`
    border-right: 1px solid ${themingVar['@divider-color']};
    min-width: ${themingVar['@leav-navigation-column-width']};
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    flex-shrink: 0;

    background: ${themingVar['@default-bg']};
`;

const ColumnContent = styled.div`
    overflow-y: auto;
    height: 100%;
`;

interface IColumnProps {
    treeElement?: INavigationElement;
    depth: number;
    isActive: boolean;
}

const Column = ({treeElement, depth, isActive: columnActive}: IColumnProps) => {
    const [activeTree] = useActiveTree();

    const {loading, error, data} = useQuery<GET_TREE_CONTENT, GET_TREE_CONTENTVariables>(treeContentQuery, {
        variables: {
            treeId: activeTree?.id,
            startAt: treeElement?.id ?? null
        },
        skip: !activeTree
    });

    const ref = createRef<HTMLDivElement>();

    useEffect(() => {
        if (ref?.current?.scrollIntoView && columnActive) {
            ref.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [ref, columnActive]);

    const children = data?.treeContent ?? [];
    const canDisplayContent = !loading && !error;
    const showDetails = treeElement && (!children.length || treeElement.showDetails);

    return (
        <ColumnWrapper ref={ref} data-testid={`navigation-column${showDetails ? '-with-details' : ''}`}>
            <HeaderColumnNavigation
                depth={depth}
                treeElement={treeElement}
                isActive={columnActive}
                isDetail={showDetails}
                children={children}
            />
            {loading && <Loading />}
            {error && <ErrorDisplay message={error.message} />}
            {canDisplayContent && !showDetails && (
                <ColumnContent>
                    {children.map(child => (
                        <Row key={child.id} treeElement={child} depth={depth} isActive={columnActive} />
                    ))}
                </ColumnContent>
            )}
            {canDisplayContent && showDetails && <DetailNavigation treeElement={treeElement} />}
        </ColumnWrapper>
    );
};

export default Column;
